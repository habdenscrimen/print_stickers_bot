import { nanoid } from 'nanoid'
import { MenuHandler } from '../..'

export const paymentUsingBot: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'select-payment-method: Payment using bot',
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

    const negativePaymentAmount = orderPrice.stickersPrice <= 0

    // create order in database
    const orderID = await ctx.services.Orders.CreateOrder({
      delivery_address: session.order.deliveryInfo!,
      delivery_cost: orderPrice.deliveryPrice,
      status: negativePaymentAmount ? 'confirmed' : 'payment_pending',
      stickers_cost: orderPrice.stickersPrice,
      user_id: ctx.from.id,
      telegram_sticker_set_name: session.order.stickerSetName!,
      telegram_sticker_file_ids: Object.values(session.order.stickers!),
      by_referral_of_user_id: session.order.invitedByTelegramUserID,
      free_stickers_used: orderPrice.freeStickersUsed,
      payment: {
        method: 'liqpay',
      },
    })
    logger = logger.child({ orderID })
    logger.debug('created order in database')

    // check if order price is positive
    if (negativePaymentAmount) {
      logger.debug('order price is 0, skipping payment')
      await ctx.reply(
        `😎 Завдяки безкоштовним наліпкам замовлення вийшло безкоштовним! Оплата лише за доставку!`,
      )
      return
    }

    // send a message explaining that user should click on "Pay" button
    await ctx.reply(`Бот підготував платіж, тисни на кнопку оплати 👇`, {
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })

    // send invoice to user
    const invoice = await ctx.replyWithInvoice(
      'Наліпки',
      `${stickersCount} надрукованих наліпок`,
      orderID,
      ctx.config.bot.liqpay.testToken,
      'UAH',
      [{ amount: orderPrice.stickersPrice * 100, label: 'Наліпки' }],
      {
        protect_content: true,
        start_parameter: nanoid(),
        provider_data: JSON.stringify({
          server_url: `${ctx.config.payment.liqpay.webhookURL}?order_id=${orderID}`,
        }),
      },
    )
    logger = logger.child({ invoice })
    logger.debug(`created invoice`)
  } catch (error) {
    logger.error(`failed to handle payment using bot: ${error}`)
  }
}
