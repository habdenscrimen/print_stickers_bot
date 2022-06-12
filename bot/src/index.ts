import * as functions from 'firebase-functions'
import { newConfig } from './config'

const config = newConfig()

export const emptyFunction = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    await (await import('./functions/empty')).default(req, res)
  })

export const botWebhooksHandler = functions
  .region(config.functions.region)
  .runWith({
    minInstances: config.env === 'production' ? 1 : 0,
    timeoutSeconds: 540,
  })
  .https.onRequest(async (req, res) => {
    await (await import('./functions/bot-webhooks-handler')).default(req, res)
  })

// TODO: add source validation (request to this endpoint can be sent from Operational Dashboard only)
export const adminCancelOrderHandler = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    await (await import('./functions/admin-cancel-order-handler')).default(req, res)
  })

export const adminGetUnansweredQuestions = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    await (await import('./functions/admin-get-unanswered-questions')).default(req, res)
  })

export const adminAnswerQuestion = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    await (await import('./functions/admin-answer-question')).default(req, res)
  })

export const liqpayWebhook = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    await (await import('./functions/liqpay-webhook')).default(req, res)
  })

export const addNotification = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    await (await import('./functions/add-notification')).default(req, res)
  })
