import { Composer } from 'grammy'
import { CustomContext } from '../../context'
import { selectStickersRouter } from './router'
import { menuDone, MenuDoneCallbackQueries } from './menus'
import { Routes } from '../../routes'
import { mainMenu } from '../main_menu/menus'

export const selectStickersComposer = new Composer<CustomContext>()

// use menus
selectStickersComposer.use(menuDone)

// use routers
selectStickersComposer.use(selectStickersRouter)

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
    const userStickerSets = ctx.user?.telegram_sticker_sets ?? []
    const updatedUserStickerSets = [...userStickerSets, session.stickerSetName!]
    const updatedUser = { ...ctx.user, telegram_sticker_sets: updatedUserStickerSets }

    await ctx.database.UpdateUser(ctx.from.id, updatedUser)
    logger.debug('saved sticker set to user in database', { updatedUser })

    // ask user to enter delivery address
    const price =
      Object.keys(session.stickers!).length * ctx.config.stickerPriceUAH - 0.01

    await ctx.reply(
      `Дякую, сума замовлення (не враховуючи доставку): ${price} грн \nНапиши дані для доставки стікерів Новою Поштою (імʼя, номер телефону, місто і номер відділення/поштомату) 📤`,
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
  await ctx.services.TelegramStickers.DeleteStickerSet(ctx, session.stickerSetName!)
  logger.debug('sticker set successfully deleted')

  // clear stickers from session
  session.stickers = {}
  session.stickerSetName = ''
  logger.debug('cleared stickers from session')

  // TODO: we need to use menu from another composer to show it to user,
  // because `jump` to another composer after changing route is performed after user action only (pressing button, entering text, etc.)
  //
  // go back to main menu
  await ctx.reply(`Окей, повертаємось 👌`, { reply_markup: mainMenu })

  // remove client loading animation
  await ctx.answerCallbackQuery()
})
