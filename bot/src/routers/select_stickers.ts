import { Router } from '@grammyjs/router'
import { CustomContext } from '../context'
import { selectStickersMenuDone } from '../menus'
import { Routes } from '../routes'

export const selectStickersRouter = new Router<CustomContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

selectStickersRouter.route(Routes.SelectStickers, async (ctx) => {
  const logger = ctx.logger.child({ name: Routes.SelectStickers })

  try {
    logger.debug('entered route')

    // check if user sent sticker
    if (!ctx.message?.sticker) {
      await ctx.reply(`Це не стікер`)
      logger.debug('received no sticker', { message: ctx.message })
      return
    }

    // check if sticker is not animated
    if (ctx.message.sticker.is_animated || ctx.message.sticker.is_video) {
      await ctx.reply(
        `Наразі анімовані стікери не підтримуються 😔 \nПродовжуй надсилати стікери`,
      )
      logger.debug('received animated sticker', { message: ctx.message })
      return
    }

    // get session
    const session = await ctx.session
    logger.debug('got session', { session })

    // if no stickers in session, create new array
    if (!session.stickers) {
      session.stickers = {}
    }

    // check if sticker is already added
    const stickerFileID = ctx.message.sticker.file_id
    const stickerID = ctx.message.sticker.file_unique_id

    // check if sticker is already added
    if (session.stickers[stickerID]) {
      const showDoneButton = Object.keys(session.stickers).length > 0

      await ctx.reply(`Цей стікер уже додано, пропускаю \nПродовжуй надсилати стікери`, {
        reply_markup: showDoneButton ? selectStickersMenuDone : undefined,
      })
      logger.debug('received duplicate sticker', { stickerFileID })
      return
    }

    // add sticker id to session
    session.stickers[stickerID] = stickerFileID
    await ctx.reply(`Отримав ✅ \nПродовжуй надсилати стікери`, {
      reply_markup: selectStickersMenuDone,
    })
    logger.debug('received new sticker', { stickerFileID })
  } catch (error) {
    logger.error('failed to select stickers', { error })
    throw error
  }
})

selectStickersRouter.otherwise(async (ctx) => {
  await ctx.reply('Надішли стікер')
})
