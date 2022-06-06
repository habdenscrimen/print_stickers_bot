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

    // show loader before creating sticker set
    await ctx.editMessageText(`⏳ Секунду...`, { reply_markup: undefined })

    // create sticker set
    const [stickerSetName, err] = await ctx.services.Telegram.CreateStickerSet(
      ctx.from.id,
      Object.values(session.order.stickers!),
    )
    if (err || !stickerSetName) {
      logger.error(`failed to create sticker set: ${err}`)

      const text = ctx.texts.SelectStickers.FailedToCreateStickerSet()
      await ctx.reply(text, {
        deleteInFuture: true,
        reply_markup: ctx.menus.Main.Main,
        parse_mode: 'MarkdownV2',
      })
      return
    }
    logger = logger.child({ stickerSetName })
    logger.debug('created sticker set')

    // update sticker set name in session to be able to delete this set later
    session.order.stickerSetName = stickerSetName

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
