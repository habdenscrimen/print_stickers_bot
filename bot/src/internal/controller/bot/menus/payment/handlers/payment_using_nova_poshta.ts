import { MenuHandler } from '../..'
import { Routes } from '../../../routes'

export const paymentUsingNovaPoshta: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'select-payment-method: Payment on Nova Poshta',
    user_id: ctx.from.id,
  })

  try {
    // get session
    const session = await ctx.session

    // get sticker price
    const stickersCount = Object.values(session.order.stickers!).length
    const orderPrice = await ctx.services.Orders.CalculateOrderPrice({
      stickersCount,
      userID: ctx.from.id,
    })
    logger = logger.child({ order_price: orderPrice })
    logger.debug('calculated order price')

    // check if order can be created without prepayment
    if (
      orderPrice.stickersPrice >
      ctx.config.payment.novaPoshta.maxOrderPriceAllowedWithoutPrepayment
    ) {
      return
    }

    // show loading
    await ctx.editMessageText(`⏳ Створюємо замовлення...`, { reply_markup: undefined })

    // create order in database
    const orderID = await ctx.services.Orders.CreateOrder({
      delivery_address: session.order.deliveryInfo!,
      delivery_cost: orderPrice.codPrice,
      status: 'confirmed',
      stickers_cost: orderPrice.stickersPrice,
      user_id: ctx.from.id,
      telegram_sticker_set_name: session.order.stickerSetName!,
      telegram_sticker_file_ids: Object.values(session.order.stickers!),
      by_referral_of_user_id: session.order.invitedByTelegramUserID,
      free_stickers_used: orderPrice.freeStickersUsed,
      payment: {
        method: 'nova_poshta',
      },
    })
    logger = logger.child({ orderID })
    logger.debug('created order in database')

    // clear order from session
    session.order = {}
    logger.debug('cleared order info from session')

    // change route to main menu
    session.route = Routes.Welcome

    // show success message to user
    const text = ctx.texts.Payment.SuccessOrderWithoutPayment()
    logger = logger.child({ text })
    logger.debug(`created message text`)

    await ctx.reply(text, {
      reply_markup: ctx.menus.Main.Main,
      parse_mode: 'MarkdownV2',
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
    logger.info(`order created`)
  } catch (error) {
    logger.error(`failed to handle payment on nova poshta: ${error}`)
  }
}
