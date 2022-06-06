import { MenuHandler } from '../..'

export const done: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'select-stickers-done-menu: Finish',
    user_id: ctx.from.id,
  })

  try {
    // get session
    const session = await ctx.session
    logger = logger.child({ session })

    const stickersCount = Object.keys(session.order.stickers!).length
    const orderPrice = await ctx.services.Orders.CalculateOrderPrice({
      stickersCount,
      userID: ctx.from!.id,
    })
    logger = logger.child({ stickers_count: stickersCount, order_price: orderPrice })
    logger.debug('calculated order price')

    // create message that motivates user to select more stickers
    const text = ctx.texts.SelectStickers.MotivateToSelectMoreStickers({
      orderPrice,
      stickersCount,
    })
    logger = logger.child({ text })

    await ctx.reply(text, {
      // reply_markup: confirmSelectStickersDoneMenu,
      reply_markup: ctx.menus.SelectStickers.FinishSelectingStickers,
      parse_mode: 'MarkdownV2',
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
    logger.debug('sent message that motivates user to select more stickers')
  } catch (error) {
    logger.error(`failed to sent message that motivates user to select more stickers: ${error}`)
  }
}
