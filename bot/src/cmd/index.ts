import * as functions from 'firebase-functions'
import { webhookCallback } from 'grammy'

import { newConfig } from '../config'
import { newApp } from '../internal/app'

const config = newConfig()
const { bot, services } = newApp(config)

export const botWebhooksHandler = functions
  .region(config.functions.region)
  .https.onRequest(webhookCallback(bot))

export const adminCancelOrderHandler = functions
  .region(config.functions.region)
  .https.onRequest(async (req, res) => {
    try {
      // get order ID from request query
      const { orderID } = req.query
      if (!orderID) {
        res.status(400).send('orderId is required')
        return
      }

      // cancel order
      await services.Orders.AdminCancelOrder(orderID as string)

      // send response
      res.status(200).send('order successfully cancelled')
    } catch (error) {
      res.status(500).send(`failed to cancel order: ${error}`)
    }
  })
