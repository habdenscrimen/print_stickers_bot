import { Menu } from '@grammyjs/menu'
import { Ctx } from '.'
import { BotContext } from '..'
import { goLike } from '../../../../pkg/function_exec'
import { confirmSelectStickersDoneMenu } from './confirm_select_stickers_done'

export const selectStickersDoneMenu = new Menu<BotContext>('select-stickers-done').text(
  `Це все`,
  finishSelectingStickers,
)

async function finishSelectingStickers(ctx: Ctx) {
  let logger = ctx.logger.child({
    name: 'select-stickers-done-menu: Finish',
    user_id: ctx.from.id,
  })

  // get session
  const session = await ctx.session
  logger = logger.child({ session })

  const stickersCount = Object.keys(session.stickers!).length
  const [orderPrice, err] = await ctx.services.Orders.CalculateOrderPrice(ctx, stickersCount)
  if (err || !orderPrice) {
    logger.error('error while calculating order price', err)
    return
  }
  logger = logger.child({ stickersCount, orderPrice })
  logger.debug('calculated order price')

  // create message that motivates user to select more stickers
  let additionalText = ''

  const priceLevel = orderPrice.orderPriceLevel
  const { tariffs } = ctx.config
  const price = tariffs[priceLevel]

  if (priceLevel === 'level_1') {
    additionalText = `\nЗамов трохи більше стікерів і ціна за стікер зменшиться:\n\n*${tariffs.level_2.stickersMin}-${tariffs.level_2.stickersMax}* стікерів: ${tariffs.level_2.stickerCost} грн/шт\nвід *${tariffs.level_3.stickersMin}* стікерів: ${tariffs.level_3.stickerCost} грн/шт\nвід *${tariffs.level_4.stickersMin}* стікерів: ${tariffs.level_4.stickerCost} грн/шт і безкоштовна доставка`
  } else if (priceLevel === 'level_2') {
    additionalText = `\nЗамов трохи більше стікерів і ціна за стікер зменшиться:\n\nвід *${tariffs.level_3.stickersMin}* стікерів: ${tariffs.level_3.stickerCost} грн/шт\nвід *${tariffs.level_4.stickersMin}* стікерів: ${tariffs.level_4.stickerCost} грн/шт і безкоштовна доставка`
  } else if (priceLevel === 'level_3') {
    additionalText = `\nЗамов ще ${
      tariffs.level_4.stickersMin - stickersCount
    } стікерів і доставка вийде безкоштовною`
  } else if (priceLevel === 'level_4') {
    additionalText = `Також доставка буде безкоштовною`
  }

  const message = `Обрано *${stickersCount}* стікерів за ціною ${price.stickerCost} грн/шт (сума замовлення *${orderPrice.stickersPrice}* грн. при вартості доставки *${orderPrice.deliveryPrice}* грн.)\n${additionalText}\n\nЩоб додати стікери, просто продовжуй їх надсилати 🚀`
  logger = logger.child({ message })

  const [_, sendMessageErr] = await goLike(
    ctx.reply(message, {
      reply_markup: confirmSelectStickersDoneMenu,
      parse_mode: 'Markdown',
      deleteInFuture: true,
      deletePrevBotMessages: true,
    }),
  )
  if (sendMessageErr) {
    logger.error(`error while sending message: ${sendMessageErr}`)
    return
  }
  logger.debug('sent message that motivates user to select more stickers')
}
