import { OrdersService, PaymentService } from '.'
import { Config } from '../../config'
import { APIs } from '../api/api'
import { Logger } from '../logger'
import { Repos } from '../repos'

interface OrdersServiceOptions {
  apis: APIs
  repos: Repos
  config: Config
  logger: Logger
  paymentService: PaymentService
}

type Service<HandlerName extends keyof OrdersService> = (
  options: OrdersServiceOptions,
  args: Parameters<OrdersService[HandlerName]>,
) => ReturnType<OrdersService[HandlerName]>

export const newOrdersService = (options: OrdersServiceOptions): OrdersService => {
  return {
    CalculateOrderPrice: (...args) => calculateOrderPrice(options, args),
    HandleCancellationRequest: (...args) => handleCancellationRequest(options, args),
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

  log.debug('calculated order price')
  return [
    {
      deliveryPrice: ctx.config.delivery.cost,
      stickersPrice,
      totalPrice,
      orderPriceLevel: priceLevel,
    },
    null,
  ]
}

const handleCancellationRequest: Service<'HandleCancellationRequest'> = async (
  { logger, paymentService },
  [ctx, orderID, reason],
) => {
  let log = logger.child({ name: 'cancelOrder', orderID })

  try {
    // get order by id
    const order = await ctx.repos.Orders.GetOrder(orderID)
    if (!order) {
      log.error('failed to find order', { orderID })
      return
    }
    log = log.child({ order })

    // check if order status is 'confirmed' (not printing)
    if (order.status === 'confirmed') {
      log.debug('order is confirmed, cancelling order immediately')

      // update order status to 'cancelled'
      await ctx.repos.Orders.UpdateOrder(orderID, {
        status: 'cancelled',
        // @ts-expect-error
        'payment.cancellation_reason': reason,
      })
      log.debug('updated order status to cancelled')

      // delete sticker set
      await ctx.services.Telegram.DeleteStickerSet(
        ctx,
        order.telegram_sticker_set_name,
        order.user_id,
      )
      log.debug('deleted sticker set')

      // create refund
      await paymentService.CreateRefund(ctx, orderID)
      log.debug('created refund')

      // TODO: create admin notification about cancellation
      return
    }

    // order is processing, create cancellation request (and then, handle it manually)
    log.debug('order is processing, creating cancellation request')

    // update order status to 'cancellation_requested'
    await ctx.repos.Orders.UpdateOrder(orderID, {
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
