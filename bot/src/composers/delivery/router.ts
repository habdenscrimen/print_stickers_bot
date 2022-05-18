import { Router } from '@grammyjs/router'
import { Keyboard } from 'grammy'
import { CustomContext } from '../../context'
import { Routes } from '../../routes'
import { OrderPriceLevel } from '../../services'
import { mainMenu } from '../main_menu/menus'
import { texts } from '../texts'

export const deliveryRouter = new Router<CustomContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

const text = texts.routes.delivery

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

      await ctx.reply(text.orderConfirmed, {
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

    const stickersCount = Object.keys(session.stickers!).length
    const orderPrice = ctx.services.Orders.CalculateOrderPrice(ctx, stickersCount)

    // if stickers count is enough for free delivery, set its price to 0
    const deliveryCost =
      orderPrice.orderPriceLevel === OrderPriceLevel.free_delivery
        ? 0
        : ctx.config.priceUAH.delivery

    // create order in database
    const orderID = await ctx.database.CreateOrder({
      delivery_address: deliveryAddress,
      status: 'confirmed',
      telegram_sticker_file_ids: Object.values(session.stickers!),
      user_id: ctx.from!.id,
      telegram_sticker_set_name: session.stickerSetName!,
      delivery_cost: deliveryCost,
      stickers_cost: orderPrice.stickersPrice,
      by_referral_of_user_id: session.invitedByUserID,
    })
    logger.debug('created order in database', { orderID })

    // check if session has invited by user id
    if (session.invitedByUserID) {
      // get invited by user
      const invitedByUser = await ctx.database.GetUser(session.invitedByUserID)
      logger.debug('got invited by user', { invitedByUser })

      // calculate free stickers count
      const freeStickersCount =
        (invitedByUser?.free_stickers_count || 0) +
        ctx.config.referral.freeStickerForInvitedUser

      // add current user id to the list of users (friends) who were invited by user
      const freeStickerForInvitedUserIDs = [
        ...(invitedByUser?.free_stickers_for_invited_user_ids || []),
        ctx.from!.id,
      ]

      // update invited by user stickers count and invited user ids
      await ctx.database.UpdateUser(session.invitedByUserID, {
        ...invitedByUser,
        free_stickers_count: freeStickersCount,
        free_stickers_for_invited_user_ids: freeStickerForInvitedUserIDs,
      })
      logger.debug('updated invited by user', { id: invitedByUser!.id })

      // get current user
      const currentUser = await ctx.database.GetUser(ctx.from!.id)
      logger.debug('got current user', { currentUser })

      // calculate current user's stickers count
      const currentUserFreeStickersCount =
        (currentUser?.free_stickers_count || 0) +
        ctx.config.referral.freeStickerForInvitedUser

      // update current user's free stickers count
      await ctx.database.UpdateUser(ctx.from!.id, {
        ...currentUser,
        free_stickers_count: currentUserFreeStickersCount,
      })
    }

    // send notification about new order
    await ctx.services.Telegram.SendAdminNotification(ctx, 'new_order', {
      stickersCost: orderPrice.stickersPrice,
    })

    // get user from database
    const user = await ctx.database.GetUser(ctx.from!.id)
    logger.debug('got user from database', { user })

    // if user not found, request contact info and save user to database
    if (!user || !user.phone_number) {
      logger.debug('user is not found in database, requesting contact info')

      const requestContactKeyboard = new Keyboard().requestContact('Надати номер')

      await ctx.reply(text.askPhoneNumber, {
        reply_markup: requestContactKeyboard,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
      return
    }

    // clear stickers from session
    session.stickers = {}
    session.stickerSetName = ''
    session.invitedByUserID = undefined
    logger.debug('cleared stickers from session')

    // redirect to main menu
    session.route = Routes.MainMenu

    await ctx.reply(text.orderConfirmed, {
      reply_markup: mainMenu,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
  } catch (error) {
    logger.error(`failed to handle '${Routes.Delivery}' route`, { error })
  }
})
