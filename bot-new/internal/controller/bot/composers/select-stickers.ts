import { Menu } from '@grammyjs/menu'
import { Composer, Keyboard } from 'grammy'
import { BotContext } from '../context'
import { SessionSteps } from '../session'
import { mainMenu, mainMenuText } from './menus/main-menu'
import { askDeliveryInfoMessages } from './ask-delivery-info'

// define composer messages
export const messages = {
  noStickerReceived: `Це не стікер 😎`,
  animatedStickerReceived: `Анімовані стікери наразі не підтримуються 😔`,
  duplicateStickerReceived: `Цей стікер уже додано, пропускаю`,
  stickerAdded: `Стікер додано ✅`,
  finishSelectingStickers: (options: { count: number; price: number; cost: number }) => {
    const { cost, count, price } = options

    let motivationalText = ``

    if (count < 6) {
      motivationalText = `Ви можете обрати 6 стікерів, і тоді вартість одного стікера зменшиться до *16 грн\\/шт*\\.`
    } else if (count < 11) {
      motivationalText = `Ви можете обрати 11 стікерів, і тоді вартість одного стікера зменшиться до *14 грн\\/шт*\\.`
    } else if (count < 25) {
      motivationalText = `Ви можете обрати 25 стікерів, і тоді за доставку заплатимо ми\\.`
    }

    return `
Обрано *${count}* стікерів за ціною *${cost} грн\\/шт* \\(всього *${price} грн*\\)\\.

${motivationalText}
`
  },
  addStickerToOrder: `Надішліть стікер, який хочете додати 👇`,
  sendStickerToRemove: `Надішліть стікер _зі створеного ботом паку_, який хочете видалити 👇`,
  askPhoneNumber: `
🤙 Для відправки замовлення нам потрібен Ваш номер телефону\\.

ℹ️ *Не хвилюйтеся*
Номер __НЕ__ розголошується третім особам і __НЕ__ буде використовуватися для відправки рекламних повідомлень\\.

ℹ️ Будь ласка, використовуйте кнопку *"Надіслати номер"* нижче, не пишіть номер вручну 👇
`,
}

// create composer
export const selectStickersComposer = new Composer<BotContext>()

// create Edit Selected Stickers menu
export const editSelectedStickersMenu = new Menu<BotContext>('edit-selected-stickers-menu')
  .text(`✅ Супер, далі`, async (ctx) => {
    // track analytics event
    ctx.analytics.trackEvent(`(tap) Edit stickers submenu: That's all`, ctx.from.id)

    // check if phone number already saved
    const isPhoneNumberSaved = await ctx.services.User.IsContactSaved({ ctx })

    if (isPhoneNumberSaved) {
      // set step to AskDeliveryInfo
      const session = await ctx.session
      session.step = SessionSteps.AskDeliveryInfo

      await ctx.reply(askDeliveryInfoMessages.entering)

      // track funnel event
      ctx.analytics.trackEvent('Funnel: Ask delivery info', ctx.from.id)
      return
    }

    // set step to AskPhoneNumber
    const session = await ctx.session
    session.step = SessionSteps.AskPhoneNumber

    // track funnel event
    ctx.analytics.trackEvent('Funnel: Ask phone number', ctx.from.id)

    await ctx.reply(messages.askPhoneNumber, {
      reply_markup: {
        keyboard: new Keyboard().requestContact('🤙 Надіслати номер').build(),
        resize_keyboard: true,
      },
    })
  })
  .row()
  .dynamic(async (ctx, range) => {
    const session = await ctx.session
    const { stickerSetName } = session.order

    range.url(`👁 Переглянути стікери`, `https://t.me/addstickers/${stickerSetName}`).row()
  })
  .row()
  .text(`➕ Додати стікер`, async (ctx) => {
    // set step to SelectStickers
    const session = await ctx.session
    session.step = SessionSteps.SelectStickers

    await ctx.reply(messages.addStickerToOrder)

    // track analytics event
    ctx.analytics.trackEvent('(tap) Edit stickers submenu: Add sticker', ctx.from.id)
  })
  .row()
  .text(`➖ Прибрати стікер`, async (ctx) => {
    // set step to RemoveStickerFromOrder
    const session = await ctx.session
    session.step = SessionSteps.RemoveStickerFromOrder

    await ctx.reply(messages.sendStickerToRemove)

    // track analytics event
    ctx.analytics.trackEvent('(tap) Edit stickers submenu: Remove sticker', ctx.from.id)
  })
  .row()

  .text(`⬅️ У головне меню`, async (ctx) => {
    // set step to MainMenu
    const session = await ctx.session
    session.step = SessionSteps.MainMenu

    // reply and delete order in parallel
    await Promise.all([
      ctx.reply(mainMenuText, { reply_markup: mainMenu }),
      ctx.services.Order.DeleteOrder({ ctx }),
    ])

    // track analytics event
    ctx.analytics.trackEvent('(tap) Edit stickers submenu: Go to main menu', ctx.from.id)
  })
  .row()

// create Finish Selecting Stickers menu
const finishSelectingStickersMenu = new Menu<BotContext>('finish-selecting-stickers-menu')
  .text(`Це все 👌`, async (ctx) => {
    const orderInfo = await ctx.services.Order.GetOrderInfo({ ctx })
    const message = messages.finishSelectingStickers({
      cost: orderInfo.stickerCost,
      price: orderInfo.price,
      count: orderInfo.stickersCount,
    })

    await ctx.reply(message, { reply_markup: editSelectedStickersMenu })

    // set step to ConfirmSelectedStickers
    const session = await ctx.session
    session.step = SessionSteps.ConfirmSelectedStickers

    // track analytics event
    ctx.analytics.trackEvent(
      `(tap) Finish selecting stickers menu: That's all`,
      ctx.from.id,
      orderInfo,
    )

    // track funnel event
    ctx.analytics.trackEvent('Funnel: Confirm selected stickers', ctx.from.id)
  })
  .row()

// add menu middleware
selectStickersComposer.use(editSelectedStickersMenu)
selectStickersComposer.use(finishSelectingStickersMenu)

// checkUpdate checks if this composer should handle incoming update
const checkUpdate = async (ctx: BotContext): Promise<boolean> => {
  const session = await ctx.session

  return session.step === SessionSteps.SelectStickers
}

// composer body
selectStickersComposer.use(async (ctx, next) => {
  const handleUpdate = await checkUpdate(ctx)

  if (!handleUpdate) {
    await next()
    return
  }

  let logger = ctx.logger.child({ name: 'select-stickers-composer' })

  try {
    // check if sticker was sent
    if (!ctx.message?.sticker) {
      await ctx.reply(messages.noStickerReceived)
      logger.debug(`no sticker received`)

      // track analytics event
      ctx.analytics.trackEvent('Select stickers scene: No sticker received', ctx.from!.id, {
        ...(ctx.message || {}),
      })
      return
    }

    // check if sticker is animated
    if (ctx.message.sticker.is_animated || ctx.message.sticker.is_video) {
      await ctx.reply(messages.animatedStickerReceived)
      logger.debug(`animated sticker received`)

      // track analytics event
      ctx.analytics.trackEvent(
        'Select stickers scene: Animated sticker received',
        ctx.from!.id,
        { ...(ctx.message || {}) },
      )
      return
    }

    // check if sticker is duplicate
    const isDuplicate = await ctx.services.Order.IsStickerDuplicate({ ctx })
    if (isDuplicate) {
      await ctx.reply(messages.duplicateStickerReceived)
      logger.debug(`duplicate sticker received`)

      // track analytics event
      ctx.analytics.trackEvent(
        'Select stickers scene: Duplicate sticker received',
        ctx.from!.id,
      )
      return
    }

    // add sticker
    await ctx.services.Order.AddSticker({ ctx })
    await ctx.reply(messages.stickerAdded, { reply_markup: finishSelectingStickersMenu })
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to handle select-stickers composer: ${error}`)
  }
})
