import * as functions from 'firebase-functions'
import { webhookCallback } from 'grammy'
import crypto from 'crypto-js'
import Base64 from 'crypto-js/enc-base64'

import { newConfig } from './config'
import { newApp } from './internal/app'

const config = newConfig()
const { bot, services, logger } = newApp(config)

export const botWebhooksHandler = functions
  .region(config.functions.region)
  // set min instances number to 1 to prevent cold start on that 1 instance
  .runWith({ maxInstances: config.env === 'production' ? 1 : 0 })
  .https.onRequest(webhookCallback(bot))

// TODO: add source validation (request to this endpoint can be sent from Operational Dashboard only)
export const adminCancelOrderHandler = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    const log = logger.child({ name: 'admin-cancel-order-handler', req })

    try {
      // get order ID from request query
      const { order_id } = req.query
      if (!order_id) {
        res.status(400).send('orderId is required')
        return
      }

      // cancel order
      await services.Orders.AdminCancelOrder(order_id as string)
      log.debug(`successfully cancelled order ${order_id} by admin`)

      // send response
      res.status(200).send('ok')
    } catch (error) {
      res.status(500).send(`failed to cancel order: ${error}`)
    }
  })

export const adminGetUnansweredQuestions = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    let log = logger.child({ name: 'admin-get-unanswered-questions-handler', req })

    try {
      // get unanswered questions
      const unansweredQuestions = await services.Question.GetUnansweredQuestions()
      log = log.child({ unansweredQuestions })
      log.info(`successfully got unanswered questions`)

      // send response
      res.status(200).send({ status: 'success', data: unansweredQuestions })
    } catch (error) {
      res
        .status(500)
        .send({ status: 'error', data: `failed to get unanswered questions: ${error}` })
    }
  })

export const adminAnswerQuestion = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    const log = logger.child({ name: 'admin-answer-question-handler', req })

    try {
      // get question ID and answer from request query
      const { question_id, answer } = req.query
      if (!question_id || !answer) {
        res.status(400).send('question_id and answer are required')
        return
      }

      // answer question
      await services.Question.AnswerQuestion({
        answer: answer as string,
        questionID: question_id as string,
      })
      log.debug(`successfully answered question ${question_id}`)

      // send response
      res.status(200).send({ status: 'success', data: 'ok' })
    } catch (error) {
      res.status(500).send({ status: 'error', data: `failed to answer question: ${error}` })
    }
  })

interface WebhookRequestBody {
  data: string
  signature: string
}

export interface WebhookPayload {
  action: string
  status: string
  order_id: string
  transaction_id: number
  amount?: number

  reserve_refund_id?: number
  refund_amount?: number
  refund_date_last?: number
  refund_reserve_ids?: number[]
  reserve_payment_id?: number
  reserve_amount?: number
  reserve_date?: number
}

export const liqpayWebhook = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    let log = logger.child({ name: 'liqpay-webhook', req })

    // TODO: move handling webhook to service

    try {
      // get order ID from request query
      const { order_id } = req.query
      if (!order_id) {
        res.status(400).send('query param order_id is required')
        return
      }
      log = log.child({ order_id })

      // get data and signature from request body
      const { data, signature } = req.body as WebhookRequestBody
      log = log.child({ data, signature })

      // get LiqPay private key from config
      const { privateKey } = config.payment.liqpay

      // validate signature to make sure that webhook data is valid
      const sourceSignature = Base64.stringify(crypto.SHA1(privateKey + data + privateKey))
      if (sourceSignature !== signature) {
        log.error('signature is invalid')
        res.status(400).send('signature is invalid')
        return
      }
      log.debug('signature is valid')

      // get transaction id from webhook body
      const payload = JSON.parse(Base64.parse(data).toString(crypto.enc.Utf8)) as WebhookPayload
      log = log.child({ payload })

      // check if webhook event is about successful payment (user paid for order)
      if (
        payload.action === 'pay' &&
        payload.status === 'success' &&
        payload.amount &&
        !payload.reserve_refund_id
      ) {
        log.info('webhook about successful payment')

        await services.Payment.HandleSuccessfulPayment({
          orderID: order_id as string,
          transactionID: payload.transaction_id,
          transactionAmount: payload.amount,
          providerOrderID: payload.order_id,
        })
        log.debug('handled successful payment')
        res.status(200).send('handled successful payment')
        return
      }

      // check if provider's payment status changed from 'wait_reserve' to 'success'
      // (it means that refund can be created now)
      if (
        payload.action === 'pay' &&
        payload.status === 'success' &&
        payload.amount &&
        payload.reserve_refund_id
      ) {
        log.info(
          `webhook about payment liqpay's status changed from wait_reserve to success, payment can be refunded now`,
        )

        await services.Payment.CreateRefund(order_id as string)
        log.debug('refund created')

        res.status(200).send('refund created')
        return
      }

      // check if webhook event is about successful refund (money already returned to user)
      if (
        payload.action === 'refund' &&
        payload.status === 'reversed' &&
        payload.refund_amount &&
        payload.refund_date_last
      ) {
        log.info(`webhook about successful refund - money refunded to user`)

        await services.Payment.HandleSuccessfulRefund({ orderID: order_id as string })
        log.info(`handled successful refund`)

        res.status(200).send('handled successful refund')
        return
      }

      res.status(200).send('ok')
    } catch (error) {
      console.log(`failed to handle webhook: ${error}`)
    }
  })

export const addNotification = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    const log = logger.child({ name: 'add-notification-function', req })

    try {
      if (!req.body.data) {
        res.status(400).send('data is required')
        return
      }

      // send notification
      await services.Notification.SendNotification(req.body.data)

      log.info(`added notification`)
      res.status(200).send({ status: 'success', data: 'ok' })
    } catch (error) {
      log.error(`failed to add notification: ${error}`)
      res.status(500).send({ status: 'error', data: error })
    }
  })
