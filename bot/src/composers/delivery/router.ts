import { Router } from '@grammyjs/router'
import { Keyboard } from 'grammy'
import { CustomContext } from '../../context'
import { Routes } from '../../routes'
import { mainMenu } from '../main_menu/menus'

export const deliveryRouter = new Router<CustomContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

deliveryRouter.route(Routes.Delivery, async (ctx) => {
  const logger = ctx.logger.child({ name: Routes.Delivery })
  logger.debug('entered route')

  try {
    // get session
    const session = await ctx.session
    logger.debug('got session', { session })

    // check if user sent a contact
    if (ctx.message?.contact) {
      // remove keyboard with `Request contact` button
      logger.debug('contact is sent')

      // save user contact to database
      const user = await ctx.database.GetUser(ctx.from!.id)

      const { first_name, last_name, phone_number } = ctx.message.contact
      await ctx.database.UpdateUser(ctx.from!.id, {
        ...user,
        first_name,
        last_name,
        phone_number,
        username: ctx.from?.username,
      })
      logger.debug('contact is saved')

      // clear stickers from session
      session.stickers = {}
      session.stickerSetName = ''
      logger.debug('cleared stickers from session')

      // redirect to main menu
      session.route = Routes.MainMenu

      await ctx.reply(`Прийняв замовлення, очікуй відправки протягом тижня ✌️`, {
        reply_markup: mainMenu,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })

      return
    }

    // check if message is not empty
    if (!ctx.message?.text) {
      logger.debug('message is not text')
      return
    }

    // get delivery address
    const deliveryAddress = ctx.message.text
    logger.debug('got delivery address', { deliveryAddress })

    const stickersCost =
      Object.keys(session.stickers!).length * ctx.config.stickerPriceUAH

    // create order in database
    const orderID = await ctx.database.CreateOrder({
      delivery_address: deliveryAddress,
      status: 'confirmed',
      telegram_sticker_file_ids: Object.values(session.stickers!),
      user_id: ctx.from!.id,
      telegram_sticker_set_name: session.stickerSetName!,
      delivery_cost: ctx.config.deliveryCostUAH,
      stickers_cost: stickersCost,
    })
    logger.debug('created order in database', { orderID })

    // send notification about new order
    await ctx.services.Telegram.SendAdminNotification(ctx, 'new_order', {
      stickersCost,
    })

    // get user from database
    const user = await ctx.database.GetUser(ctx.from!.id)
    logger.debug('got user from database', { user })

    // if user not found, request contact info and save user to database
    if (!user || !user.phone_number) {
      logger.debug('user is not found in database, requesting contact info')

      const requestContactKeyboard = new Keyboard().requestContact('Надати номер')

      await ctx.reply(`Мені потрібен твій номер телефону`, {
        reply_markup: requestContactKeyboard,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
      return
    }

    // clear stickers from session
    session.stickers = {}
    session.stickerSetName = ''
    logger.debug('cleared stickers from session')

    // redirect to main menu
    session.route = Routes.MainMenu

    await ctx.reply(`Прийняв замовлення, очікуй відправки протягом тижня ✌️`, {
      reply_markup: mainMenu,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
  } catch (error) {
    logger.error('error', { error })
  }
})
