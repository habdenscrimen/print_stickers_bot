import { Composer } from 'grammy'
import { CustomContext } from '../../context'
import { selectStickersRouter } from './router'
import { menuDone, MenuDoneCallbackQueries } from './menus'
import { Routes } from '../../routes'
import { mainMenu } from '../main_menu/menus'
import { User } from '../../domain'
import { texts } from '../texts'
import { OrderPriceLevel } from '../../services'

export const selectStickersComposer = new Composer<CustomContext>()

// use menus
selectStickersComposer.use(menuDone)

// use routers
selectStickersComposer.use(selectStickersRouter)

const text = texts.routes.selectStickers

// define callback queries
selectStickersComposer.callbackQuery(
  MenuDoneCallbackQueries.ConfirmStickers,
  async (ctx) => {
    const logger = ctx.logger.child({
      name: 'selectStickersComposerCallbackQuery',
      query: MenuDoneCallbackQueries.ConfirmStickers,
    })

    // set route to delivery
    const session = await ctx.session
    session.route = Routes.Delivery
    logger.debug('set route to delivery')

    // save sticker set to user in database
    await ctx.database.UpdateUser(
      ctx.from.id,
      {},
      { newTelegramStickerSet: session.stickerSetName! },
    )
    logger.debug('saved sticker set to user in database')

    // ask user to enter delivery address
    const stickersCount = Object.keys(session.stickers!).length
    const orderPrice = ctx.services.Orders.CalculateOrderPrice(ctx, stickersCount)

    await ctx.reply(
      text.confirmationMessage({
        deliveryPrice: ctx.config.priceUAH.delivery,
        isDeliveryFree: orderPrice.orderPriceLevel === OrderPriceLevel.free_delivery,
        stickersPrice: orderPrice.stickersPrice,
        totalPrice: orderPrice.totalPrice,
      }),
      {
        deleteInFuture: true,
        deletePrevBotMessages: true,
      },
    )

    // remove client loading animation
    await ctx.answerCallbackQuery()
  },
)

selectStickersComposer.callbackQuery(MenuDoneCallbackQueries.Cancel, async (ctx) => {
  const logger = ctx.logger.child({
    name: 'selectStickersComposerCallbackQuery',
    query: MenuDoneCallbackQueries.Cancel,
  })

  // set route to delivery
  const session = await ctx.session
  session.route = Routes.MainMenu
  logger.debug('set route to main menu')

  // delete sticker set
  await ctx.services.Telegram.DeleteStickerSet(ctx, session.stickerSetName!)
  logger.debug('sticker set successfully deleted')

  // clear stickers from session
  session.stickers = {}
  session.stickerSetName = ''
  logger.debug('cleared stickers from session')

  // TODO: we need to use menu from another composer to show it to user,
  // because `jump` to another composer after changing route is performed after user action only (pressing button, entering text, etc.)
  //
  // go back to main menu
  await ctx.reply(text.cancelOrder, {
    reply_markup: mainMenu,
    deleteInFuture: true,
    deletePrevBotMessages: true,
  })

  // remove client loading animation
  await ctx.answerCallbackQuery()
})
