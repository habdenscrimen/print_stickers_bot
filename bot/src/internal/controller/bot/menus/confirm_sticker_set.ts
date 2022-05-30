import { Menu } from '@grammyjs/menu'
import { Ctx } from '.'
import { BotContext } from '..'
import { goLike } from '../../../../pkg/function_exec'
import { Routes } from '../routes'
import { askDeliveryInfoText, goBackToMainMenuText } from '../texts'
import { mainMenu } from './main'

export const confirmStickerSet = new Menu<BotContext>('confirm-sticker-set')
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

async function confirmStickers(ctx: Ctx) {
  const logger = ctx.logger.child({
    name: 'confirm-sticker-set-menu: Confirm',
    user_id: ctx.from.id,
  })

  // get session
  const session = await ctx.session

  // set route to delivery
  session.route = Routes.Delivery
  logger.debug('set route to delivery')

  // save sticker set to user in database
  const [_, updateUserErr] = await goLike(
    ctx.repos.Users.UpdateUser(
      ctx.from.id,
      {},
      { newTelegramStickerSet: session.order.stickerSetName! },
    ),
  )
  if (updateUserErr) {
    logger.error(`failed to update user: ${updateUserErr}`)
    return
  }
  logger.debug('saved sticker set to user in database')

  // ask user to enter delivery address
  await ctx.editMessageText(askDeliveryInfoText.text, {
    parse_mode: askDeliveryInfoText.parseMode,
    reply_markup: undefined,
    deleteInFuture: true,
  })
}

async function cancelStickers(ctx: Ctx) {
  const logger = ctx.logger.child({
    name: 'confirm-sticker-set-menu: Cancel',
    user_id: ctx.from.id,
  })

  try {
    // get session
    const session = await ctx.session

    // set route to welcome
    session.route = Routes.Welcome
    logger.debug('set route to welcome')

    // delete sticker set
    await ctx.services.Telegram.DeleteStickerSet(ctx.from.id, session.order.stickerSetName!)
    logger.debug('sticker set successfully deleted')

    // clear stickers from session
    session.order.stickers = {}
    session.order.stickerSetName = ''
    logger.debug('cleared stickers from session')

    // go back to main menu
    await ctx.editMessageText(goBackToMainMenuText.text, {
      reply_markup: mainMenu,
      deleteInFuture: true,
    })
  } catch (error) {
    logger.error(`failed to cancel selecting stickers: ${error}`)
  }
}
