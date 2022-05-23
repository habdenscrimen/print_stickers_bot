import { Menu } from '@grammyjs/menu'
import { nanoid } from 'nanoid'
import { Ctx } from '.'
import { BotContext } from '..'

export const selectPaymentMethod = new Menu<BotContext>('select-payment-method')
  .text(`1️⃣ Оплатити за допомогою бота`, paymentUsingBot)
  .row()
// .text(`Оплатити на Новій Пошті`, paymentUsingBot)
// .row()

async function paymentUsingBot(ctx: Ctx) {
  let logger = ctx.logger.child({
    name: 'select-payment-method: Payment using bot',
    user_id: ctx.from.id,
  })

  try {
    // get session
    const session = await ctx.session

    // get sticker price
    const stickersCount = Object.values(session.order.stickers!).length
    const [orderPrice, getPriceErr] = await ctx.services.Orders.CalculateOrderPrice(
      ctx,
      stickersCount,
    )
    if (!orderPrice || getPriceErr) {
      logger.error(`failed to calculate order price`)
      return
    }
    logger = logger.child({ orderPrice })
    logger.debug('calculated order price')

    // create order in database
    const orderID = await ctx.repos.Orders.CreateOrder({
      delivery_address: session.order.deliveryInfo!,
      delivery_cost: orderPrice.deliveryPrice,
      status: 'payment_pending',
      stickers_cost: orderPrice.stickersPrice,
      user_id: ctx.from.id,
      telegram_sticker_set_name: session.order.stickerSetName!,
      telegram_sticker_file_ids: Object.values(session.order.stickers!),
      by_referral_of_user_id: session.order.invitedByTelegramUserID,
      paid: false,
    })
    logger = logger.child({ orderID })
    logger.debug('created order in database')

    // send a message explaining that user should click on "Pay" button
    await ctx.reply(`Створив платіж, тисни на кнопку оплати 👇`, {
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
      },
    )
    logger = logger.child({ invoice })
    logger.debug(`created invoice`)
  } catch (error) {
    logger.error(`failed to handle payment using bot: ${error}`)
  }
}
