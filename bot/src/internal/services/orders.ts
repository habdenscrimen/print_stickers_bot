import { OrdersService, PaymentService, TelegramService } from '.'
import { Config } from '../../config'
import { APIs } from '../api/api'
import { OrderStatus } from '../domain'
import { Logger } from '../logger'
import { Repos } from '../repos'

interface OrdersServiceOptions {
  apis: APIs
  repos: Repos
  config: Config
  logger: Logger
  paymentService: PaymentService
  telegramService: TelegramService
}

type Service<HandlerName extends keyof OrdersService> = (
  options: OrdersServiceOptions,
  args: Parameters<OrdersService[HandlerName]>,
) => ReturnType<OrdersService[HandlerName]>

export const newOrdersService = (options: OrdersServiceOptions): OrdersService => {
  return {
    CalculateOrderPrice: (...args) => calculateOrderPrice(options, args),
    HandleCancellationRequest: (...args) => handleCancellationRequest(options, args),
    AdminCancelOrder: (...args) => adminCancelOrder(options, args),
  }
}

const calculateOrderPrice: Service<'CalculateOrderPrice'> = async (
  { logger },
  [ctx, stickersCount],
) => {
  let log = logger.child({ name: 'calculateOrderPrice' })
  log = log.child({ stickersCount })

  let priceLevel: keyof Config['tariffs']

  // find price level by stickers count
  Object.entries(ctx.config.tariffs).forEach(([key, value]) => {
    if (stickersCount >= value.stickersMin && stickersCount <= value.stickersMax) {
      priceLevel = key as keyof Config['tariffs']
    }
  })

  // @ts-expect-error
  if (!priceLevel) {
    log.error('failed to find price level', { stickersCount })
    return [null, new Error('failed to find price level')]
  }
  log = log.child({ priceLevel })
  log.debug(`found price level`)

  const price = ctx.config.tariffs[priceLevel]
  log = log.child({ price })

  // calculate stickers price
  const stickersPrice = price.stickerCost * stickersCount
  log = log.child({ stickersPrice })

  // calculate total price (stickers + delivery)
  const totalPrice = stickersPrice + ctx.config.delivery.cost
  log = log.child({ totalPrice })

  // calculate C.O.D. price
  const codPrice =
    ctx.config.delivery.cost +
    ctx.config.delivery.paybackFixCost +
    (stickersPrice * ctx.config.delivery.paybackPercentCost) / 100

  log.debug('calculated order price')
  return [
    {
      deliveryPrice: ctx.config.delivery.cost,
      codPrice,
      stickersPrice,
      totalPrice,
      orderPriceLevel: priceLevel,
    },
    null,
  ]
}

const handleCancellationRequest: Service<'HandleCancellationRequest'> = async (
  { logger, paymentService, repos, telegramService },
  [orderID, reason],
) => {
  let log = logger.child({ name: 'handleCancellationRequest', order_id: orderID })

  try {
    // get order by id
    const order = await repos.Orders.GetOrder(orderID)
    if (!order) {
      log.error('failed to find order', { orderID })
      return
    }
    log = log.child({ order })

    // check if order status is 'confirmed' (not printing)
    if (order.status === 'confirmed') {
      log.debug('order is confirmed, cancelling order immediately')

      // update order status to 'cancelled'
      await repos.Orders.UpdateOrder(orderID, {
        status: 'cancelled',
        // @ts-expect-error
        'payment.cancellation_reason': reason,
      })
      log.debug('updated order status to cancelled')

      // delete sticker set
      await telegramService.DeleteStickerSet(order.user_id, order.telegram_sticker_set_name)
      log.debug('deleted sticker set')

      // create refund
      await paymentService.CreateRefund(orderID)

      // TODO: create admin notification about cancellation
      return
    }

    // order is processing, create cancellation request (and then, handle it manually)
    log.debug('order is processing, creating cancellation request')

    // update order status to 'cancellation_requested'
    await repos.Orders.UpdateOrder(orderID, {
      status: 'cancellation_pending',
      // @ts-expect-error
      'payment.cancellation_reason': reason,
    })
    log.debug('updated order status to cancellation_requested')

    // TODO: create admin notification about cancellation request
  } catch (error) {
    log.error(`failed to handle cancellation request: ${error}`)
    throw new Error(`failed to handle cancellation request: ${error}`)
  }
}

const adminCancelOrder: Service<'AdminCancelOrder'> = async (
  { logger, paymentService, repos, telegramService },
  [orderID],
) => {
  let log = logger.child({ name: 'adminCancelOrder', order_id: orderID })

  try {
    // get order by id
    const order = await repos.Orders.GetOrder(orderID)
    if (!order) {
      log.error('failed to find order', { orderID })
      return
    }
    log = log.child({ order })
    log.debug('got order')

    // if order status is not one of these, update its status to 'cancelled'
    const excludeStatusesFromUpdating = new Set<OrderStatus>([
      'cancelled',
      'refunded',
      'refund_failed_wait_reserve',
    ])

    if (!excludeStatusesFromUpdating.has(order.status)) {
      await repos.Orders.UpdateOrder(orderID, { status: 'cancelled' })
      log.debug('updated order status to cancelled')
    }

    // delete sticker set
    await telegramService.DeleteStickerSet(order.user_id, order.telegram_sticker_set_name)
    log.debug('deleted sticker set')

    // if order status is not refunded, create refund (it can be refunded if order was cancelled by admin but refund creation failed)
    if (order.status !== 'refunded') {
      await paymentService.CreateRefund(orderID)
    }

    // TODO: send notification that order is cancelled and refund is created
  } catch (error) {
    log.error(`failed to cancel order as admin: ${error}`)
    throw new Error(`failed to cancel order as admin: ${error}`)
  }
}
