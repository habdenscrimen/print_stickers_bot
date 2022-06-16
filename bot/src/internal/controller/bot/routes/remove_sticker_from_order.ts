import { RouteHandler, Routes } from '.'
import { notStickerSelectedText } from '../texts'

export const removeStickerFromOrder: RouteHandler = (nextRoute) => async (ctx) => {
  let logger = ctx.logger.child({
    name: 'remove-sticker-from-order-route',
    user_id: ctx.from!.id,
  })

  try {
    // get session
    const session = await ctx.session
    logger = logger.child({ session })
    logger.debug('got session')

    // check if user sent sticker
    if (!ctx.message?.sticker) {
      await ctx.reply(notStickerSelectedText.text, {
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
      logger.debug('received no sticker', { message: ctx.message })
      return
    }
    logger = logger.child({ message: ctx.msg })
    logger.debug(`received message`)

    const { order } = session

    console.log(JSON.stringify(ctx.message, null, 2))

    // get sticker set
    const stickerSet = await ctx.api.getStickerSet(order.stickerSetName!)
    logger = logger.child({ stickerSet })
    logger.debug('got sticker set')

    console.log(`stickers ${JSON.stringify(stickerSet.stickers, null, 2)}`)
    console.log(`session stickers: ${JSON.stringify(session.order.stickers, null, 2)}`)

    // get set's file ids
    const stickerSetFileIDs = stickerSet.stickers.map((sticker) => sticker.file_id)

    const receivedStickerFileID = ctx.message.sticker.file_id

    // check if sticker in order's stickers
    if (!stickerSetFileIDs.includes(receivedStickerFileID)) {
      const text = ctx.texts.SelectStickers.StickerNotInOrder()

      // TODO: show menu here

      await ctx.reply(text, {
        reply_markup: ctx.menus.SelectStickers.GoToConfirmStickerSet,
        parse_mode: 'MarkdownV2',
        deleteInFuture: true,
      })
      logger.debug('received sticker not in order')
      return
    }

    // show loader
    await ctx.reply(`⏳ Видаляємо...`, { deleteInFuture: true })

    // remove sticker from sticker set
    await ctx.services.Telegram.RemoveStickerFromSet({ stickerFileID: receivedStickerFileID })
    logger.debug('sticker successfully removed from sticker set')

    // get sticker info
    const sticker = stickerSet.stickers.find(
      (sticker) => sticker.file_id === receivedStickerFileID,
    )
    logger = logger.child({ sticker })
    logger.debug('got sticker')

    // remove sticker from order
    const { originalStickerFileUniqueID } = session.order.stickersRelation!.find(
      ({ stickerFileUniqueID }) => stickerFileUniqueID === sticker!.file_unique_id,
    )!
    delete session.order.stickers![originalStickerFileUniqueID]
    logger.debug('removed sticker from order')

    // if there are no more stickers in order, go to main menu
    if (Object.keys(session.order.stickers!).length === 0) {
      session.route = Routes.Welcome
      session.order = {}

      const text = ctx.texts.SelectStickers.AllStickersRemovedFromOrder()
      await ctx.reply(text, {
        reply_markup: ctx.menus.Main.Main,
        parse_mode: 'MarkdownV2',
      })

      logger.debug(`all stickers removed from order`)
      return
    }

    // ask for another sticker
    const text = ctx.texts.SelectStickers.StickerRemovedFromOrder()
    await ctx.reply(text, {
      parse_mode: 'MarkdownV2',
      reply_markup: ctx.menus.SelectStickers.GoToConfirmStickerSet,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to remove sticker from order: ${error}`)
  }
}
