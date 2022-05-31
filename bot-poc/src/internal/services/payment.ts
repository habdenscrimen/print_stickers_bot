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
    HandleSuccessfulPayment: (...args) => handleSuccessfulPayment(options, args),
    HandleSuccessfulRefund: (...args) => handleSuccessfulRefund(options, args),
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
    log = log.child({ order })

    // check that order contains provider transaction ID
    if (
      !order.payment?.provider_transaction_id ||
      !order.payment.provider_order_id ||
      !order.payment.provider_transaction_amount
    ) {
      throw new Error(`order with ID ${orderID} has no payment info`)
    }

    // check if refund is not already created
    if (order.status === 'refund_success_wait_amount' || order.status === 'refunded') {
      log.info(`payment with order ID ${orderID} already refunded`)
      return
    }

    // create refund in psp
    const { wait_reserve, wait_amount } = await apis.PSP.CreateRefund({
      orderID: order.payment.provider_order_id,
      amount: order.payment.provider_transaction_amount,
    })

    // check if refund is not created (waiting for next payments)
    if (wait_reserve) {
      log.debug(`refund is not created, waiting for next payments`)

      if (order.status !== 'refund_failed_wait_reserve') {
        await repos.Orders.UpdateOrder(orderID, { status: 'refund_failed_wait_reserve' })
        log.debug(`order status updated`)
      }
      return
    }

    // check if refund is created but not processed by provider (waiting for next payments)
    if (wait_amount) {
      log.debug(`refund is created, waiting for next payments`)
      await repos.Orders.UpdateOrder(orderID, { status: 'refund_success_wait_amount' })

      log.debug(`order status updated`)
      return
    }

    // refund is created and processed by provider
    log.debug(`refund in psp created`)

    // TODO: create notification about order refunded
  } catch (error) {
    log.error(`failed to create refund: ${error}`)
    throw new Error(`failed to create refund: ${error}`)
    // TODO: create admin notification that order cannot be refunded
  }
}

const handleSuccessfulPayment: Service<'HandleSuccessfulPayment'> = async (
  { logger, repos },
  [{ orderID, transactionID, transactionAmount, providerOrderID }],
) => {
  const log = logger.child({
    name: 'handle-successful-payment-service',
    order_id: orderID,
    transaction_id: transactionID,
    transaction_amount: transactionAmount,
    provider_order_id: providerOrderID,
  })

  try {
    // update order status and transaction id in database
    await repos.Orders.UpdateOrder(orderID, {
      // @ts-expect-error
      'payment.provider_transaction_id': Number(transactionID),
      'payment.provider_transaction_amount': Number(transactionAmount),
      'payment.provider_order_id': providerOrderID,
      'payment.method': 'liqpay',
      status: 'confirmed',
    })
    log.debug('order status updated')
  } catch (error) {
    log.error(`failed to handle successful payment: ${error}`)
    throw new Error(`failed to handle successful payment: ${error}`)
  }
}

const handleSuccessfulRefund: Service<'HandleSuccessfulRefund'> = async (
  { logger, repos },
  [{ orderID }],
) => {
  const log = logger.child({ name: 'handle-successful-refund-service', order_id: orderID })

  try {
    // update order status
    await repos.Orders.UpdateOrder(orderID, { status: 'refunded' })
    log.info(`updated order status to 'refunded'`)
  } catch (error) {
    log.error(`failed to handle successful refund: ${error}`)
    throw new Error(`failed to handle successful refund: ${error}`)
  }
}
