import { Menu } from '@grammyjs/menu'
import { Composer } from 'grammy'
import { BotContext } from '../context'
import { SessionSteps } from '../session'
import { mainMenu, mainMenuText } from './menus/main-menu'

export const askDeliveryInfoMessages = {
  entering: `
🚚 Будь ласка, напишіть дані для доставки стікерів Новою Поштою\\:

👉 Імʼя отримувача
👉 Місто і номер відділення\\/поштомату

*Наприклад\\:*
Прізвище Імʼя По\\-батькові, м\\. Місто, відділення 12\\.

_Не хвилюйтеся щодо формату, пишіть як зручно 😎_
`,
  noDeliveryInfoReceived: `
🚚 Будь ласка, напишіть дані для доставки стікерів Новою Поштою\\:

👉 Імʼя отримувача
👉 Місто і номер відділення\\/поштомату

*Наприклад\\:*
Прізвище Імʼя По\\-батькові, м\\. Місто, відділення 12\\.

_Не хвилюйтеся щодо формату, пишіть як зручно 😎_
`,
  orderCreated: `
✅ Замовлення успішно оформлене і буде відправлено до кінця наступного робочого тижня\\.

А зараз повертаємось у головне меню 👇
`,
  askToConfirmOrder: (options: { price: number }) => `
  🚚 Оплатити замовлення можна при отриманні на Новій Пошті\\.

  👉 Вартість замовлення: *${options.price} грн*\\.
  👉 Вартість доставки: *45 грн*\\. \\(*50 грн*\\. при доставці у поштомат\\)
  `,
}

const confirmOrderMenu = new Menu<BotContext>('confirm-order-menu')
  .text(`🚚 Підтверджую замовлення`, async (ctx) => {
    // create order
    await ctx.services.Order.CreateOrder({ ctx })

    // set step to MainMenu
    const session = await ctx.session
    session.step = SessionSteps.MainMenu

    await ctx.reply(askDeliveryInfoMessages.orderCreated, { reply_markup: mainMenu })
  })
  .row()
  .text(`❌ Скасувати замовлення`, async (ctx) => {
    // set step to MainMenu
    const session = await ctx.session
    session.step = SessionSteps.MainMenu

    // reply and delete order in parallel
    await Promise.all([
      ctx.reply(mainMenuText, { reply_markup: mainMenu }),
      ctx.services.Order.DeleteOrder({ ctx }),
    ])
  })
  .row()

// create composer
export const askDeliveryInfoComposer = new Composer<BotContext>()

askDeliveryInfoComposer.use(confirmOrderMenu)

// checkUpdate checks if this composer should handle incoming update
const checkUpdate = async (ctx: BotContext): Promise<boolean> => {
  const session = await ctx.session

  return session.step === SessionSteps.AskDeliveryInfo
}

// composer body
askDeliveryInfoComposer.use(async (ctx, next) => {
  const handleUpdate = await checkUpdate(ctx)

  if (!handleUpdate) {
    await next()
    return
  }

  let logger = ctx.logger.child({ name: 'ask-delivery-info-composer' })

  try {
    // check if text was sent
    if (!ctx.message?.text) {
      await ctx.reply(askDeliveryInfoMessages.noDeliveryInfoReceived)
      logger.debug(`no delivery info received`)
      return
    }

    // save delivery info
    await ctx.services.Order.SaveDeliveryInfo({ ctx })

    // set step to ConfirmOrder
    const session = await ctx.session
    session.step = SessionSteps.ConfirmOrder

    // reply with menu
    const orderInfo = await ctx.services.Order.GetOrderInfo({ ctx })
    const message = askDeliveryInfoMessages.askToConfirmOrder({ price: orderInfo.price })

    await ctx.reply(message, { reply_markup: confirmOrderMenu })
  } catch (error) {
    console.log(error)

    logger = logger.child({ error })
    logger.error(`failed to handle ask-phone-number composer: ${error}`)
  }
})
