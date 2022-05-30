import { RouteHandler } from '.'
import { selectStickersDoneMenu } from '../menus/select_stickers_done'
import {
  animatedStickersNotSupportedText,
  gotStickerText,
  notStickerSelectedText,
  stickerAlreadySelectedText,
} from '../texts'

export const selectStickers: RouteHandler = (nextRoute) => async (ctx) => {
  let logger = ctx.logger.child({ name: 'select-stickers-route', user_id: ctx.from!.id })

  // check if user sent sticker
  if (!ctx.message?.sticker) {
    await ctx.reply(notStickerSelectedText.text, {
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
    logger.debug('received no sticker', { message: ctx.message })
    return
  }

  // get session
  const session = await ctx.session
  logger = logger.child({ session })
  logger.debug('got session')

  // if no stickers in session, create an empty object
  if (!session.order.stickers) {
    session.order.stickers = {}
  }

  // save stickers count to constant
  const stickersCount = Object.keys(session.order.stickers).length

  // check if sticker is not animated
  if (ctx.message.sticker.is_animated || ctx.message.sticker.is_video) {
    const showDoneButton = stickersCount > 0

    await ctx.reply(animatedStickersNotSupportedText.text, {
      reply_markup: showDoneButton ? selectStickersDoneMenu : undefined,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })

    logger.debug('received animated sticker', { message: ctx.message })
    return
  }

  // get sticker unique id
  const stickerID = ctx.message.sticker.file_unique_id
  logger = logger.child({ stickerID })

  // check if sticker is already added
  if (session.order.stickers[stickerID]) {
    const showDoneButton = stickersCount > 0

    await ctx.reply(stickerAlreadySelectedText.text, {
      reply_markup: showDoneButton ? selectStickersDoneMenu : undefined,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })

    logger.debug('received duplicate sticker', { stickerID })
    return
  }

  // add sticker id to session
  session.order.stickers[stickerID] = ctx.message.sticker.file_id

  // send user a message that sticker was added
  await ctx.reply(gotStickerText(stickersCount + 1).text, {
    reply_markup: selectStickersDoneMenu,
    deleteInFuture: true,
    deletePrevBotMessages: true,
  })
  logger.debug('received sticker', { stickerID })
}
