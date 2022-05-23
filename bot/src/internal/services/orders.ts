import { OrdersService } from '.'
import { Config } from '../../config'

type Service<HandlerName extends keyof OrdersService> = (
  args: Parameters<OrdersService[HandlerName]>,
) => ReturnType<OrdersService[HandlerName]>

export const newOrdersService = (): OrdersService => {
  return {
    CalculateOrderPrice: (...args) => calculateOrderPrice(args),
  }
}

const calculateOrderPrice: Service<'CalculateOrderPrice'> = async ([ctx, stickersCount]) => {
  let logger = ctx.logger.child({ name: 'calculateOrderPrice' })
  logger = logger.child({ stickersCount })

  let priceLevel: keyof Config['tariffs']

  // find price level by stickers count
  Object.entries(ctx.config.tariffs).forEach(([key, value]) => {
    if (stickersCount >= value.stickersMin && stickersCount <= value.stickersMax) {
      priceLevel = key as keyof Config['tariffs']
    }
  })

  // @ts-expect-error
  if (!priceLevel) {
    logger.error('failed to find price level', { stickersCount })
    return [null, new Error('failed to find price level')]
  }
  logger = logger.child({ priceLevel })
  logger.debug(`found price level`)

  const price = ctx.config.tariffs[priceLevel]
  logger = logger.child({ price })

  // calculate stickers price
  const stickersPrice = price.stickerCost * stickersCount
  logger = logger.child({ stickersPrice })

  // calculate total price (stickers + delivery)
  const totalPrice = stickersPrice + ctx.config.delivery.cost
  logger = logger.child({ totalPrice })

  logger.debug('calculated order price')
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
