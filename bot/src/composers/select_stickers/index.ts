import { Composer } from 'grammy'
import { CustomContext } from '../../context'
import { selectStickersRouter } from './router'
import { menuDone, MenuDoneCallbackQueries } from './menus'
import { Routes } from '../../routes'
import { mainMenu } from '../main_menu/menus'
import { User } from '../../domain'
import { withDeleteMessage } from '../../hof'

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

    const user = await ctx.database.GetUser(ctx.from.id)

    const updatedUser: Partial<User> = {
      ...user,
      telegram_sticker_sets: [
        ...(user?.telegram_sticker_sets || []),
        session.stickerSetName!,
      ],
    }

    // save sticker set to user in database
    await ctx.database.UpdateUser(ctx.from.id, updatedUser)
    logger.debug('saved sticker set to user in database', { updatedUser })

    // ask user to enter delivery address
    const price =
      Object.keys(session.stickers!).length * ctx.config.stickerPriceUAH - 0.01

    await withDeleteMessage(ctx, (ctx) =>
      ctx.reply(
        `Дякую, сума замовлення (не враховуючи доставку): ${price} грн \nНапиши дані для доставки стікерів Новою Поштою (імʼя, номер телефону, місто і номер відділення/поштомату) 📤`,
      ),
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
  await withDeleteMessage(ctx, (ctx) =>
    ctx.reply(`Окей, повертаємось 👌`, { reply_markup: mainMenu }),
  )

  // remove client loading animation
  await ctx.answerCallbackQuery()
})
