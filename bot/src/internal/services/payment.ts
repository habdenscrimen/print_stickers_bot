import { PaymentService } from '.'
import { Config } from '../../config'
import { APIs } from '../api/api'
import { Logger } from '../logger'
import { Repos } from '../repos'

interface PaymentServiceOptions {
  apis: APIs
  repos: Repos
  config: Config
  logger: Logger
}

type Service<HandlerName extends keyof PaymentService> = (
  options: PaymentServiceOptions,
  args: Parameters<PaymentService[HandlerName]>,
) => ReturnType<PaymentService[HandlerName]>

export const newPaymentService = (options: PaymentServiceOptions): PaymentService => {
  return {
    CreateRefund: (...args) => createRefund(options, args),
  }
}

const createRefund: Service<'CreateRefund'> = async ({ apis, logger, repos }, [orderID]) => {
  let log = logger.child({ name: 'create-refund-service', order_id: orderID })

  try {
    // get order's provider transaction ID
    const order = await repos.Orders.GetOrder(orderID)
    if (!order) {
      throw new Error(`order with ID ${orderID} not found`)
    }
    if (!order.payment?.provider_transaction_id) {
      throw new Error(`order with ID ${orderID} has no payment info`)
    }
    log = log.child({ order })

    // create refund in psp
    const { wait_reserve } = await apis.PSP.CreateRefund(order.payment.provider_transaction_id)

    // check if refund created (not waiting for next payments)
    if (wait_reserve) {
      log.debug(`refund not created, waiting for next payments`)

      if (order.status !== 'refund_failed_wait_reserve') {
        await repos.Orders.UpdateOrder(orderID, { status: 'refund_failed_wait_reserve' })
        log.debug(`order status updated`)
      }
      return
    }
    log.debug(`refund in psp created`)

    // update order status in database
    await repos.Orders.UpdateOrder(orderID, { status: 'refunded' })
    log.debug(`order status updated`)

    // TODO: create notification about order refunded
  } catch (error) {
    log.error(`failed to create refund: ${error}`)
    throw new Error(`failed to create refund: ${error}`)
    // TODO: create admin notification that order cannot be refunded
  }
}
