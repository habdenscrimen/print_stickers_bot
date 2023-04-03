import { Menu } from '@grammyjs/menu'
import { PromoCode } from 'internal/domain/promo-code'
import { BotContext } from '../../context'
import { SessionSteps } from '../../session'

const faqDocURL = `https://telegra.ph/St%D1%96kasi--pitannya-v%D1%96dpov%D1%96d%D1%96-07-02`
const supportBotURL = `https://t.me/stickasy_support`

export const mainMenuText = (promoCode?: PromoCode) => {
  const getPrice = (normalPrice: number, promoCode?: PromoCode) => {
    return promoCode
      ? Math.floor(normalPrice - (normalPrice / 100) * promoCode.discountPercent)
      : normalPrice
  }

  const price = {
    level_1: getPrice(18, promoCode),
    level_2: getPrice(16, promoCode),
    level_3: getPrice(14, promoCode),
  }

  return `
Привіт 👋
Цей бот друкує стікери з Телеграму\\.

*Як це працює*
1️⃣ Надсилаєте боту стікери\\.
2️⃣ Вводите дані доставки Новою Поштою\\.
3️⃣ Через тиждень ми відправляємо Вам надруковані стікери\\.
${
  promoCode
    ? `\n🎉 Ви використали промо\\-код __${promoCode?.code}__ і отримуєте знижку *${promoCode?.discountPercent}%* на перше замовлення\\!\n`
    : ''
}
*Зверніть увагу*, що чим більше стікерів Ви замовите, тим нижчою буде ціна\\:
👉 1\\-5 — ${promoCode ? `~18~ ` : ''}${price.level_1} грн\\/шт
👉 1\\-5 — ${promoCode ? `~16~ ` : ''}${price.level_2} грн\\/шт
👉 1\\-5 — ${promoCode ? `~14~ ` : ''}${price.level_3} грн\\/шт
🚚 від 25 — безкоштовна доставка

🇺🇦 *10%* прибутку ЗСУ\\!

Щоб зробити замовлення _\\(або просто поклацати бота 😄\\)_, тисніть на кнопку нижче 👇
`
}

const createOrderInstructionText = `
Надішліть стікери, які хочете надрукувати 👇
`

export const mainMenu = new Menu<BotContext>('main-menu')
  .text(`🚀 Замовити стікери`, async (ctx) => {
    await ctx.reply(createOrderInstructionText)

    // set step to SelectStickers
    const session = await ctx.session
    session.step = SessionSteps.SelectStickers

    // track funnel event
    ctx.analytics.trackEvent('Funnel: Select stickers', ctx.from.id)

    // track analytics event
    ctx.analytics.trackEvent('(tap) Main menu: Order stickers', ctx.from.id)
  })
  .row()
  .text(`❓ Є питання`, async (ctx) => {
    ctx.menu.nav('faq-submenu')

    // track analytics event
    ctx.analytics.trackEvent('(tap) Main menu: Have a question', ctx.from!.id)
  })
  .row()

const faqSubmenu = new Menu<BotContext>('faq-submenu')
  .url(`📃 Список популярних питань`, faqDocURL)
  .row()
  .url(`✍️ Поставити питання`, supportBotURL)
  .row()
  .text(`⬅️ Назад`, async (ctx) => {
    ctx.menu.back()

    // track analytics event
    ctx.analytics.trackEvent('(tap) FAQ submenu: Back to Main menu', ctx.from!.id)
  })
  .row()

mainMenu.register(faqSubmenu)
