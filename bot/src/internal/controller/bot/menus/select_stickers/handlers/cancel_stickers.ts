import { MenuHandler } from '../..'
import { Routes } from '../../../routes'

export const cancelStickers: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'confirm-sticker-set-menu: Cancel',
    user_id: ctx.from.id,
  })

  try {
    // get session
    const session = await ctx.session

    // set route to welcome
    session.route = Routes.Welcome
    logger.debug('set route to welcome')

    // delete sticker set
    await ctx.services.Telegram.DeleteStickerSet(ctx.from.id, session.order.stickerSetName!)
    logger.debug('sticker set successfully deleted')

    // clear stickers from session
    session.order.stickers = {}
    session.order.stickerSetName = ''
    logger.debug('cleared stickers from session')

    const text = ctx.texts.Shared.GoBackToMainMenu()
    logger = logger.child({ text })
    logger.debug(`created message`)

    // go back to main menu
    await ctx.editMessageText(text, {
      reply_markup: ctx.menus.Main.Main,
      parse_mode: 'MarkdownV2',
      deleteInFuture: true,
    })
  } catch (error) {
    logger.error(`failed to cancel selecting stickers: ${error}`)
  }
}
