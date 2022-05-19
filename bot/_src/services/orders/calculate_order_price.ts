import { OrderService } from '.'
import { OrderPriceLevel } from '..'
import { Config } from '../../config'

const getStickerCostAndPriceLevel = (
  stickersCount: number,
  price: Config['priceUAH'],
  freeDeliveryAfterStickersCount: number,
): { stickerCost: number; priceLevel: OrderPriceLevel } => {
  if (stickersCount < 6) {
    return {
      stickerCost: price.stickerUnder6,
      priceLevel: OrderPriceLevel.less_than_6_stickers,
    }
  }

  if (stickersCount < 10) {
    return {
      stickerCost: price.stickerUnder10,
      priceLevel: OrderPriceLevel.less_than_10_stickers,
    }
  }

  if (stickersCount < freeDeliveryAfterStickersCount) {
    return {
      stickerCost: price.stickerAfter10,
      priceLevel: OrderPriceLevel.more_than_10_stickers,
    }
  }

  return {
    stickerCost: price.stickerAfter10,
    priceLevel: OrderPriceLevel.free_delivery,
  }
}

export const calculateOrderPrice: OrderService<'CalculateOrderPrice'> = ([
  ctx,
  stickersCount,
]) => {
  const logger = ctx.logger.child({ name: 'calculateOrderPrice' })
  logger.debug({ stickersCount })

  try {
    const { stickerCost, priceLevel } = getStickerCostAndPriceLevel(
      stickersCount,
      ctx.config.priceUAH,
      ctx.config.freeDeliveryAfterStickersCount,
    )
    const stickersPrice = stickerCost * stickersCount
    const totalPrice = stickersPrice + ctx.config.priceUAH.delivery

    return {
      totalPrice,
      stickerCost,
      stickersPrice,
      orderPriceLevel: priceLevel,
    }
  } catch (error) {
    logger.error('failed to calculate order price', { error })
    throw new Error(`failed to calculate order price: ${error}`)
  }
}
