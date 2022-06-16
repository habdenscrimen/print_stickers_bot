import { MenuHandler } from '../..'
import { Routes } from '../../../routes'

export const addSticker: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'confirm-sticker-set-menu: Add sticker',
    user_id: ctx.from.id,
  })

  try {
    // get session
    const session = await ctx.session

    session.route = Routes.SelectStickers

    // send a message asking for the sticker
    const text = ctx.texts.SelectStickers.AddStickerToOrder()
    await ctx.reply(text, { parse_mode: 'MarkdownV2' })
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to add sticker to set`)
  }
}
