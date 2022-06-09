import { MenuHandler } from '../..'
import { Routes } from '../../../routes'

export const finishSelectingStickers: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'confirm-select-stickers-done-menu: Confirm',
    user_id: ctx.from.id,
  })

  try {
    // get session
    const session = await ctx.session
    // FIXME: without this line it does not redirect to `selectStickersComposer.callbackQuery`, and I don't know why
    session.route = Routes.Delivery
    logger = logger.child({ session })

    // ask user to confirm stickers
    const text = ctx.texts.SelectStickers.ConfirmSelectedStickers()
    await ctx.editMessageText(text, {
      reply_markup: ctx.menus.SelectStickers.ConfirmStickerSet,
      parse_mode: 'MarkdownV2',
      deleteInFuture: true,
    })
  } catch (error) {
    logger.error(`failed to confirm selected stickers: ${error}`)
  }
}
