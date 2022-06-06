import { Menu } from '@grammyjs/menu'
import { SelectStickersMenus } from '..'
import { BotContext } from '../..'
import { Config } from '../../../../../config'
import { cancelStickers } from './handlers/cancel_stickers'
import { confirmStickers } from './handlers/confirm_stickers'
import { done } from './handlers/done'
import { finishSelectingStickers } from './handlers/finish_selecting_stickers'

interface SelectStickersMenusOptions {
  config: Config
}

export const newSelectStickersMenus = (
  options: SelectStickersMenusOptions,
): SelectStickersMenus => {
  return {
    ConfirmStickerSet: confirmStickerSetMenu(options),
    FinishSelectingStickers: finishSelectingStickersMenu(options),
    Done: doneMenu(options),
  }
}

const finishSelectingStickersMenu = (options: SelectStickersMenusOptions) =>
  new Menu<BotContext>('confirm-select-stickers-done').dynamic(async (ctx, range) => {
    let log = ctx.logger.child({ name: 'confirm-select-stickers-done-menu' })

    try {
      // get session
      const session = await ctx.session

      const stickersCount = Object.keys(session.order.stickers!).length
      const orderPrice = await ctx.services.Orders.CalculateOrderPrice({
        stickersCount,
        userID: ctx.from!.id,
      })
      log = log.child({ order_price: orderPrice })

      if (orderPrice.orderPriceLevel === 'level_4') {
        range.text(`👌 Мені вистачить`, finishSelectingStickers)
        return
      }

      range.text(`👌 Знаю, але мені вистачить`, finishSelectingStickers)
    } catch (error) {
      log.error(`failed to dynamically create menu button text: ${error}`)
    }
  })

export const confirmStickerSetMenu = (options: SelectStickersMenusOptions) =>
  new Menu<BotContext>('confirm-sticker-set')
    .dynamic(async (ctx, range) => {
      // get session
      const session = await ctx.session

      range
        .url(`💅 Переглянути пак`, `https://t.me/addstickers/${session.order.stickerSetName}`)
        .row()
    })
    .text(`✅ Все супер, підтверджую`, confirmStickers)
    .row()
    .text(`❌ Давай спочатку`, cancelStickers)
    .row()

const doneMenu = (options: SelectStickersMenusOptions) =>
  new Menu<BotContext>('select-stickers-done').text(`👌 Це все`, done)
