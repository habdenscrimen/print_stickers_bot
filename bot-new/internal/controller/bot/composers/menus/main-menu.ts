import { Menu } from '@grammyjs/menu'
import { BotContext } from '../../context'
import { SessionSteps } from '../../session'

const faqDocURL = `https://print-telegram-stickers.notion.site/22a245fe0495451ca5614150e2f092ee`
const supportBotURL = `https://t.me/stickasy_support_bot`

export const mainMenuText = `
Привіт 👋
Цей бот друкує стікери з Телеграму\\.

*Як це працює*
1️⃣ Надсилаєте боту стікери\\.
2️⃣ Вводите номер телефону і адресу доставки\\.
3️⃣ Ми відправляємо стікери Новою Поштою\\.

🇺🇦 *10%* прибутку ЗСУ\\!

Щоб зробити замовлення _\\(або просто поклацати бота 😄\\)_, тисніть на кнопку нижче 👇
`

const createOrderInstructionText = `
🚀 Надішліть потрібні стікери\\!

ℹ️ Розмір надрукованого стікера — *4х4* см\\.
\\(Якщо стікер у Телеграмі менший, то і надрукований відповідно буде меншим\\.\\)

*Зверніть увагу*, що чим більше стікерів Ви замовите, тим нижчою буде ціна\\:
👉 1\\-5 — 18 грн\\/шт
👉 6\\-10 — 16 грн\\/шт
👉 від 11 — 14 грн\\/шт
🚚 від 25 — безкоштовна доставка

Надсилайте стікери прямо зараз 👇
`

export const mainMenu = new Menu<BotContext>('main-menu')
  .text(`🚀 Замовити стікери`, async (ctx) => {
    await ctx.editMessageText(createOrderInstructionText)

    ctx.menu.nav('create-order-submenu')

    // set step to SelectStickers
    const session = await ctx.session
    session.step = SessionSteps.SelectStickers
  })
  .row()
  .submenu(`❓ Поставити питання`, 'faq-submenu')
  .row()
// .text(`✉️ Мої замовлення`, async (ctx) => {
//   await ctx.reply('Мої замовлення')
// })
// .row()

const faqSubmenu = new Menu<BotContext>('faq-submenu')
  .url(`📃 Список популярних питань`, faqDocURL)
  .row()
  .url(`✍️ Поставити питання`, supportBotURL)
  .row()
  .back(`⬅️ Назад`)
  .row()

const createOrderSubmenu = new Menu<BotContext>('create-order-submenu')
  .text(`⬅️ Назад`, async (ctx) => {
    await ctx.editMessageText(mainMenuText)

    ctx.menu.back()

    // set step to MainMenu
    const session = await ctx.session
    session.step = SessionSteps.MainMenu
  })
  .row()

mainMenu.register(faqSubmenu)
mainMenu.register(createOrderSubmenu)