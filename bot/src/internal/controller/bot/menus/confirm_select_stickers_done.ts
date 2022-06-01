import { Menu } from '@grammyjs/menu'
import { Ctx } from '.'
import { BotContext } from '..'
import { Routes } from '../routes'
import { confirmSelectedStickersText, failedToCreateStickerSetText } from '../texts'
import { confirmStickerSet } from './confirm_sticker_set'
import { mainMenu } from './main'

export const confirmSelectStickersDoneMenu = new Menu<BotContext>(
  'confirm-select-stickers-done',
).dynamic(async (ctx, range) => {
  // get session
  const session = await ctx.session

  const stickersCount = Object.keys(session.order.stickers!).length
  const [orderPrice, err] = await ctx.services.Orders.CalculateOrderPrice(ctx, stickersCount)
  if (err || !orderPrice) {
    console.error('error while calculating order price', err)
    return
  }

  if (orderPrice.orderPriceLevel === 'level_4') {
    range.text(`👌 Мені вистачить`, confirmSelectedStickers)
    return
  }

  range.text(`👌 Знаю, але мені вистачить`, confirmSelectedStickers)
})

async function confirmSelectedStickers(ctx: Ctx) {
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
      await ctx.reply(failedToCreateStickerSetText.text, {
        deleteInFuture: true,
        reply_markup: mainMenu,
      })
      return
    }
    logger = logger.child({ stickerSetName })
    logger.debug('created sticker set')

    // update sticker set name in session to be able to delete this set later
    session.order.stickerSetName = stickerSetName

    // ask user to confirm stickers
    await ctx.editMessageText(confirmSelectedStickersText.text, {
      reply_markup: confirmStickerSet,
      deleteInFuture: true,
    })
  } catch (error) {
    logger.error(`failed to confirm selected stickers: ${error}`)
  }
}
