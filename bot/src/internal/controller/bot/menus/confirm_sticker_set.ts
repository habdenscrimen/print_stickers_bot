import { Menu } from '@grammyjs/menu'
import { Ctx } from '.'
import { BotContext } from '..'
import { goLike } from '../../../../pkg/function_exec'
import { Routes } from '../routes'
import { mainMenu } from './main'

export const confirmStickerSet = new Menu<BotContext>('confirm-sticker-set')
  .dynamic(async (ctx, range) => {
    // get session
    const session = await ctx.session

    range.url(`Мої стікери`, `https://t.me/addstickers/${session.stickerSetName}`).row()
  })
  .text(`Все супер, підтверджую`, confirmStickers)
  .row()
  .text(`Я помилився, давай спочатку`, cancelStickers)
  .row()

async function confirmStickers(ctx: Ctx) {
  let logger = ctx.logger.child({
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
      { newTelegramStickerSet: session.stickerSetName! },
    ),
  )
  if (updateUserErr) {
    logger.error(`failed to update user: ${updateUserErr}`)
    return
  }
  logger.debug('saved sticker set to user in database')

  // get stickers count
  const stickersCount = Object.keys(session.stickers!).length
  // calculate order price
  const [orderPrice, getPriceErr] = await ctx.services.Orders.CalculateOrderPrice(
    ctx,
    stickersCount,
  )
  if (!orderPrice || getPriceErr) {
    logger.error(`failed to calculate order price`)
    return
  }
  logger = logger.child({ orderPrice })
  logger.debug('calculated order price')

  const { deliveryPrice, stickersPrice, totalPrice } = orderPrice

  // delivery price text
  const deliveryPriceText =
    deliveryPrice === 0 ? `доставка безкоштовна` : `доставка — ${deliveryPrice} грн`

  // delivery info text
  const askDeliveryInfo = `Напиши дані для доставки стікерів Новою Поштою (імʼя, номер телефону, місто і номер відділення/поштомату) 📤`

  // message text
  const message = `Дякую, сума замовлення — ${stickersPrice} грн, ${deliveryPriceText}, всього — ${totalPrice} грн.\nОплата при отриманні на Новій Пошті.\n\n${askDeliveryInfo}`

  // ask user to enter delivery address
  await ctx.reply(message, { deleteInFuture: true, deletePrevBotMessages: true })
}

async function cancelStickers(ctx: Ctx) {
  const logger = ctx.logger.child({
    name: 'confirm-sticker-set-menu: Cancel',
    user_id: ctx.from.id,
  })

  // get session
  const session = await ctx.session

  // set route to welcome
  session.route = Routes.Welcome
  logger.debug('set route to welcome')

  // delete sticker set
  const deleteSetErr = await ctx.services.Telegram.DeleteStickerSet(
    ctx,
    session.stickerSetName!,
  )
  if (deleteSetErr) {
    logger.error(`failed to delete sticker set: ${deleteSetErr}`)
    return
  }
  logger.debug('sticker set successfully deleted')

  // clear stickers from session
  session.stickers = {}
  session.stickerSetName = ''
  logger.debug('cleared stickers from session')

  // go back to main menu
  const [_, sendMessageErr] = await goLike(
    ctx.reply(`Відмінив замовлення, повертаємось у головне меню 👌`, {
      reply_markup: mainMenu,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    }),
  )
  if (sendMessageErr) {
    logger.error(`failed to send message: ${sendMessageErr}`)
  }
}
