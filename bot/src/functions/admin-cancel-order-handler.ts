import * as functions from 'firebase-functions'
import { newConfig } from '../config'
import { newApp } from '../internal/app'

const config = newConfig()
const { services, logger } = newApp(config)

export default async (req: functions.https.Request, res: functions.Response) => {
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
}
