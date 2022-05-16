import { Router } from '@grammyjs/router'
import { CustomContext } from '../../context'
import { menuDone } from './menus'
import { Routes } from '../../routes'
import { texts } from '../texts'

export const selectStickersRouter = new Router<CustomContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

const text = texts.routes.selectStickers

selectStickersRouter.route(Routes.SelectStickers, async (ctx) => {
  const logger = ctx.logger.child({ name: Routes.SelectStickers })

  try {
    logger.debug('entered route')

    // check if user sent sticker
    if (!ctx.message?.sticker) {
      await ctx.reply(`Це не стікер`, {
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
      logger.debug('received no sticker', { message: ctx.message })
      return
    }

    // get session
    const session = await ctx.session
    logger.debug('got session', { session })

    // if no stickers in session, create new array
    if (!session.stickers) {
      session.stickers = {}
    }

    // check if sticker is not animated
    if (ctx.message.sticker.is_animated || ctx.message.sticker.is_video) {
      const showDoneButton = Object.keys(session.stickers).length > 0

      await ctx.reply(text.animatedStickerNotSupported, {
        reply_markup: showDoneButton ? menuDone : undefined,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })

      logger.debug('received animated sticker', { message: ctx.message })
      return
    }

    // check if sticker is already added
    const stickerFileID = ctx.message.sticker.file_id
    const stickerID = ctx.message.sticker.file_unique_id

    // check if sticker is already added
    if (session.stickers[stickerID]) {
      const showDoneButton = Object.keys(session.stickers).length > 0

      await ctx.reply(text.alreadyAddedSticker, {
        reply_markup: showDoneButton ? menuDone : undefined,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })

      logger.debug('received duplicate sticker', { stickerFileID })
      return
    }

    // add sticker id to session
    session.stickers[stickerID] = stickerFileID

    await ctx.reply(text.stickerReceived, {
      reply_markup: menuDone,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })

    logger.debug('received new sticker', { stickerFileID })
  } catch (error) {
    logger.error('failed to select stickers', { error })
  }
})
