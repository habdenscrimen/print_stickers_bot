import { Menu } from '@grammyjs/menu'
import { nanoid } from 'nanoid'
import { Ctx } from '.'
import { BotContext } from '..'
import { Routes } from '../routes'
import { mainMenu } from './main'

export const selectPaymentMethod = new Menu<BotContext>('select-payment-method')
  .text(`💳 Оплатити за допомогою бота`, paymentUsingBot)
  .row()
  .text(`🚚 Оплатити на Новій Пошті`, paymentOnNovaPoshta)
  .row()

// the same as menu above but without option to pay on Nova Poshta
export const selectPaymentMethodInBot = new Menu<BotContext>(
  'select-payment-method-in-bot',
).text(`💳 Оплатити за допомогою бота`, paymentUsingBot)

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
    const orderID = await ctx.services.Orders.CreateOrder({
      delivery_address: session.order.deliveryInfo!,
      delivery_cost: orderPrice.deliveryPrice,
      status: 'payment_pending',
      stickers_cost: orderPrice.stickersPrice,
      user_id: ctx.from.id,
      telegram_sticker_set_name: session.order.stickerSetName!,
      telegram_sticker_file_ids: Object.values(session.order.stickers!),
      by_referral_of_user_id: session.order.invitedByTelegramUserID,
    })
    logger = logger.child({ orderID })
    logger.debug('created order in database')

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

async function paymentOnNovaPoshta(ctx: Ctx) {
  let logger = ctx.logger.child({
    name: 'select-payment-method: Payment on Nova Poshta',
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

    // check if order can be created without prepayment
    if (
      orderPrice.stickersPrice >
      ctx.config.payment.novaPoshta.maxOrderPriceAllowedWithoutPrepayment
    ) {
      return
    }

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
    await ctx.reply(`✅ Замовлення оформлене!`, {
      reply_markup: mainMenu,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
    logger.info(`order created`)
  } catch (error) {
    logger.error(`failed to handle payment on nova poshta: ${error}`)
  }
}
