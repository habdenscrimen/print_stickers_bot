import * as functions from 'firebase-functions'
import crypto from 'crypto-js'
import Base64 from 'crypto-js/enc-base64'
import { newConfig } from '../config'
import { newApp } from '../internal/app'

const config = newConfig()

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

export default functions.region(config.functions.region).https.onRequest(async (req, res) => {
  const { services, logger } = newApp(config)
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
