import { Menu } from '@grammyjs/menu'
import { Ctx } from '.'
import { BotContext } from '..'
import { motivateToSelectMoreStickersText } from '../texts'
import { confirmSelectStickersDoneMenu } from './confirm_select_stickers_done'

export const selectStickersDoneMenu = new Menu<BotContext>('select-stickers-done').text(
  `👌 Це все`,
  finishSelectingStickers,
)

async function finishSelectingStickers(ctx: Ctx) {
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
    const message = motivateToSelectMoreStickersText({
      config: ctx.config,
      orderPrice,
      stickersCount,
    })
    logger = logger.child({ message })

    await ctx.reply(message.text, {
      reply_markup: confirmSelectStickersDoneMenu,
      parse_mode: message.parseMode,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
    logger.debug('sent message that motivates user to select more stickers')
  } catch (error) {
    logger.error(`failed to sent message that motivates user to select more stickers: ${error}`)
  }
}
