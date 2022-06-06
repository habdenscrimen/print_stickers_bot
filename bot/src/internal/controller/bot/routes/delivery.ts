import { Keyboard } from 'grammy'
import { RouteHandler, Routes } from '.'
import { goLike } from '../../../../pkg/function_exec'
import { askPhoneNumberText } from '../texts'

export const delivery: RouteHandler = (nextRoute) => async (ctx) => {
  let logger = ctx.logger.child({ name: 'delivery-route', user_id: ctx.from!.id })

  try {
    // check if message is not text
    if (!ctx.message?.text && !ctx.message?.contact) {
      logger.debug('message is not text')
      await ctx.reply('Будь ласка, напиши дані для доставки', {
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
      return
    }

    // get session
    const session = await ctx.session

    // check if user sent delivery info
    if (ctx.message.text) {
      // get delivery info
      const deliveryInfo = ctx.message.text
      logger = logger.child({ deliveryInfo })
      logger.debug('got delivery info')

      // save delivery info to session
      session.order.deliveryInfo = deliveryInfo
      logger.debug('saved delivery info to session')
    }

    // check if user sent a contact
    if (ctx.message.contact) {
      // get phone number
      const { phone_number } = ctx.message.contact

      // save phone number to session
      session.user!.phone_number = phone_number
      logger.debug('saved phone number to session')

      // save phone number to database
      const [_, err] = await goLike(ctx.repos.Users.UpdateUser(ctx.from!.id, { phone_number }))
      if (err) {
        logger.error(`failed to save phone number to database: ${err}`)
        await ctx.reply('Не вдалося зберегти номер телефону', {
          reply_markup: ctx.menus.Main.Main,
        })
        return
      }
      logger.debug('saved phone number to database')
    }

    // check if contact if not provided
    if (!ctx.message.contact && !session.user?.phone_number) {
      // ask user to send contact
      await ctx.reply(askPhoneNumberText.text, {
        reply_markup: {
          keyboard: new Keyboard().requestContact('🤙 Надати номер').build(),
          resize_keyboard: true,
          remove_keyboard: true,
        },
        parse_mode: askPhoneNumberText.parseMode,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
      logger.debug(`asked to send contact`)
      return
    }

    // change route to payment
    session.route = Routes.Payment

    // get order price
    const orderPrice = await ctx.services.Orders.CalculateOrderPrice({
      stickersCount: Object.keys(session.order.stickers!).length,
      userID: ctx.from!.id,
    })
    logger = logger.child({ order_price: orderPrice })
    logger.debug('calculated order price')

    // check if nova poshta is available
    const novaPoshtaAvailable =
      orderPrice.stickersPrice <=
      ctx.config.payment.novaPoshta.maxOrderPriceAllowedWithoutPrepayment
    logger = logger.child({ nova_poshta_available: novaPoshtaAvailable })

    // check if stickers are free for user (user has free stickers from referral program)
    if (orderPrice.stickersPrice === 0) {
      // create order
      // create order in database
      const orderID = await ctx.services.Orders.CreateOrder({
        delivery_address: session.order.deliveryInfo!,
        delivery_cost: orderPrice.codPrice,
        status: 'confirmed',
        stickers_cost: orderPrice.stickersPrice,
        user_id: ctx.from!.id,
        telegram_sticker_set_name: session.order.stickerSetName!,
        telegram_sticker_file_ids: Object.values(session.order.stickers!),
        by_referral_of_user_id: session.order.invitedByTelegramUserID,
        free_stickers_used: orderPrice.freeStickersUsed,
        payment: {
          method: 'free_order',
        },
      })
      logger = logger.child({ orderID })
      logger.debug('created order in database')

      // clear order from session
      session.order = {}
      logger.debug('cleared order info from session')

      // change route to main menu
      session.route = Routes.Welcome

      // show message about successful order
      logger.debug(`order created for free`)
      const text = ctx.texts.Payment.SuccessOrderWithoutPayment()

      await ctx.reply(text, {
        parse_mode: 'MarkdownV2',
        reply_markup: ctx.menus.Main.Main,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
      return
    }

    // create payment info message
    const text = ctx.texts.Payment.SelectPaymentMethod({ novaPoshtaAvailable, orderPrice })
    logger = logger.child({ text })

    // show payment info with payment options
    await ctx.reply(text, {
      reply_markup: ctx.config.features.liqPay
        ? ctx.menus.Payment.SelectPaymentMethod
        : ctx.menus.Payment.ChooseNovaPoshtaMethod,
      parse_mode: 'MarkdownV2',
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
    logger.debug(`asked to select payment option`)
  } catch (error) {
    logger.error(`failed to handle delivery route: ${error}`)
  }
}
