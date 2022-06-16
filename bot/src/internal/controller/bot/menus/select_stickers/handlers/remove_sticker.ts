import { MenuHandler } from '../..'
import { Routes } from '../../../routes'

export const removeSticker: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'confirm-sticker-set-menu: Remove sticker',
    user_id: ctx.from.id,
  })

  try {
    // get session
    const session = await ctx.session

    // update route
    session.route = Routes.RemoveStickerFromOrder

    // send a message asking for the sticker
    const text = ctx.texts.SelectStickers.RemoveStickerFromOrder()
    await ctx.reply(text, { parse_mode: 'MarkdownV2' })
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to add sticker to set`)
  }
}
