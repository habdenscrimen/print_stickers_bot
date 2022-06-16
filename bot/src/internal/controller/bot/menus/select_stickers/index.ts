import { Menu } from '@grammyjs/menu'
import { SelectStickersMenus } from '..'
import { BotContext } from '../..'
import { Config } from '../../../../../config'
import { Routes } from '../../routes'
import { addSticker } from './handlers/add_sticker'
import { cancelStickers } from './handlers/cancel_stickers'
import { confirmStickers } from './handlers/confirm_stickers'
import { done } from './handlers/done'
import { finishSelectingStickers } from './handlers/finish_selecting_stickers'
import { removeSticker } from './handlers/remove_sticker'

interface SelectStickersMenusOptions {
  config: Config
}

export const newSelectStickersMenus = (
  options: SelectStickersMenusOptions,
): SelectStickersMenus => {
  const confirmStickerSet = confirmStickerSetMenu(options)
  const goToConfirmStickerSet = goToConfirmStickerSetMenu(options)

  confirmStickerSet.register(goToConfirmStickerSet)

  return {
    ConfirmStickerSet: confirmStickerSet,
    FinishSelectingStickers: finishSelectingStickersMenu(options),
    Done: doneMenu(options),
    GoToConfirmStickerSet: goToConfirmStickerSet,
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
        .url(`👁 Переглянути пак`, `https://t.me/addstickers/${session.order.stickerSetName}`)
        .row()
    })
    .text(`➕ Додати наліпку`, addSticker)
    .row()
    .text(`➖ Видалити наліпку`, removeSticker)
    .row()
    .text(`✅ Все супер, підтверджую`, confirmStickers)
    .row()
    .text(`❌ У головне меню`, cancelStickers)
    .row()

const goToConfirmStickerSetMenu = (options: SelectStickersMenusOptions) => {
  return new Menu<BotContext>('go-to-confirm-sticker-set')
    .dynamic(async (ctx, range) => {
      // get session
      const session = await ctx.session

      range
        .url(`👁 Переглянути пак`, `https://t.me/addstickers/${session.order.stickerSetName}`)
        .row()
    })
    .text(`⬅️ Назад`, async (ctx) => {
      // set route to delivery
      const session = await ctx.session
      session.route = Routes.Delivery

      await ctx.menu.nav(`confirm-sticker-set`, { immediate: true })
    })
}

const doneMenu = (options: SelectStickersMenusOptions) =>
  new Menu<BotContext>('select-stickers-done').text(`👌 Це все`, done)
