import { Router } from '@grammyjs/router'
import { CustomContext } from '../../context'
import { Routes } from '../../routes'

export const deliveryRouter = new Router<CustomContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

deliveryRouter.route(Routes.Delivery, async (ctx) => {
  const logger = ctx.logger.child({ name: Routes.Delivery })
  logger.debug('entered route')
  try {
    if (!ctx.message?.text) {
      logger.debug('message is not text')
      return
    }

    // get delivery address
    const deliveryAddress = ctx.message.text
    logger.debug('got delivery address', { deliveryAddress })

    // get session
    const session = await ctx.session
    logger.debug('got session', { session })

    // create order in database
    const orderID = await ctx.database.CreateOrder({
      delivery_address: deliveryAddress,
      status: 'confirmed',
      sticker_file_ids: Object.values(session.stickers!),
      user_id: ctx.from!.id,
    })
    logger.debug('created order in database', { orderID })

    await ctx.reply(`Delivery route`)
  } catch (error) {
    logger.error('error', { error })
  }
})
