import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { escapeMarkdown, MainMenuTexts, TextOptions } from '.'
import { orderStatuses } from './order_statuses'

dayjs.extend(utc)
dayjs.extend(timezone)

type Text<TextName extends keyof MainMenuTexts> = (
  options: TextOptions,
  args: Parameters<MainMenuTexts[TextName]>,
) => ReturnType<MainMenuTexts[TextName]>

export const newMainMenuTexts = (options: TextOptions): MainMenuTexts => {
  return {
    Start: (...args) => escapeMarkdown(start(options, args)),
    SelectStickersInstructions: (...args) =>
      escapeMarkdown(selectStickersInstructions(options, args)),
    ActiveOrdersList: (...args) => escapeMarkdown(activeOrdersList(options, args)),
    MyOrders: () => escapeMarkdown(myOrders(options, [])),
    CancelOrdersList: (...args) => escapeMarkdown(cancelOrdersList(options, args)),
  }
}

const start: Text<'Start'> = ({ config }, [{ invitedByName }]) => {
  if (config.features.referralProgram) {
    return `
Привіт 👋
Цей бот друкує наліпки з Телеграму, просто як ніколи.
${
  invitedByName
    ? `\n👫 Тебе запросив(ла) ${invitedByName}! Як тільки ти зробиш перше замовлення, ви удвох отримаєте по 3 безкоштовних стікера!\n`
    : ''
}
*Як це працює*
1️⃣ Надсилаєш боту свої улюблені наліпки.
2️⃣ Вводиш адресу доставки і номер телефону.
3️⃣ Обираєш спосіб оплати.
4️⃣ Ми друкуємо твої наліпки і відправляємо Новою Поштою.

👫 *Запроси друга*
І ви удвох отримаєте по *3* безкоштовних наліпки 🔥

🇺🇦 *10%* прибутку донатимо ЗСУ!

Давай зробимо перше замовлення! Тисни на кнопку нижче 👇
`
  }

  return `
Привіт 👋
Цей бот друкує наліпки з Телеграму, просто як ніколи.

*Як це працює*
1️⃣ Надсилаєш боту свої улюблені наліпки.
2️⃣ Вводиш адресу доставки і номер телефону.
3️⃣ Обираєш спосіб оплати.
4️⃣ Ми друкуємо твої наліпки і відправляємо Новою Поштою.

🇺🇦 *10%* прибутку донатимо ЗСУ!

Давай зробимо перше замовлення! Тисни на кнопку нижче 👇
  `
}

const selectStickersInstructions: Text<'SelectStickersInstructions'> = (
  { config },
  [{ freeStickersCount }],
) => {
  if (config.features.referralProgram && freeStickersCount) {
    return `
    🚀 Супер, надішли потрібні наліпки!
    ${
      freeStickersCount > 0
        ? `\n🎉 У тебе є *${freeStickersCount}* безкоштовних наліпок за запрошення друзів, їх вартість [автоматично вирахується](https://telegra.ph/Bezkoshtovn%D1%96-nal%D1%96pki-06-01) із суми замовлення.\n`
        : ''
    }
    ℹ️ Розмір надрукованої наліпки — *4х4* см. Якщо наліпка у Телеграмі менша, то і надрукована відповідно буде меншою.
    
    *Зверни увагу*, що чим більше наліпок ти замовиш, тим нижчою буде ціна:
    👉 до 6 — 18 грн/шт
    👉 від 6 до 11 — 16 грн/шт
    👉 від 11 — 14 грн/шт
    🚚 від 25 — безкоштовна доставка
    
    Чекаю наліпки 👇
      `
  }

  return `
🚀 Супер, надішли потрібні наліпки!

ℹ️ Розмір надрукованої наліпки — *4х4* см. Якщо наліпка у Телеграмі менша, то і надрукована відповідно буде меншою.

*Зверни увагу*, що чим більше наліпок ти замовиш, тим нижчою буде ціна:
👉 до 6 — 18 грн/шт
👉 від 6 до 11 — 16 грн/шт
👉 від 11 — 14 грн/шт
🚚 від 25 — безкоштовна доставка

Чекаю наліпки 👇
  `
}

const activeOrdersList: Text<'ActiveOrdersList'> = ({ config }, [{ orders }]) => {
  // create a message with user's orders
  const ordersMessage = orders
    .map((order, index) => {
      const title = `#${
        orders.length - index
      } [Наліпки](https://t.me/addstickers/${order.telegram_sticker_set_name.replace(
        /\_/gm,
        '\\_',
      )})`
      const status = `Статус: ${orderStatuses[order.status]}`

      const date = `_Дата створення_: ${dayjs(order.created_at)
        .tz('Europe/Kiev')
        .format('DD.MM.YYYY, HH:mm')}`

      const stickersCount = `_Кількість наліпок_: ${order.telegram_sticker_file_ids.length}`

      const deliveryAddress = `_Адреса доствки_: ${order.delivery_address}`
      const price = `_Ціна (без доставки)_: ${order.stickers_cost} грн`

      return `${title}\n${status}\n${date}\n${stickersCount}\n${deliveryAddress}\n${price}\n\n`
    })
    .join('\n')

  return `
Твої замовлення:

${ordersMessage}
`
}

const myOrders: Text<'MyOrders'> = ({ config }) => {
  return `
У цьому меню ти можеш:

🚚 Переглянути свої активні замовлення.
💅 Переглянути паки наліпок, створені при замовленні.
❌ Скасувати замовлення.
  `
}

const cancelOrdersList: Text<'CancelOrdersList'> = ({ config }, [{ orders }]) => {
  // create a message with user's orders
  const ordersMessage = orders
    .map((order, index) => {
      const title = `#${orders.length - index} [Наліпки](https://t.me/addstickers/${
        order.telegram_sticker_set_name
      })`
      const status = `_Статус_: ${orderStatuses[order.status]}`

      const date = `_Дата створення_: ${dayjs(order.created_at)
        .tz('Europe/Kiev')
        .format('DD.MM.YYYY, HH:mm')}`

      const stickersCount = `_Кількість наліпок_: ${order.telegram_sticker_file_ids.length}`

      const deliveryAddress = `_Адреса доствки_: ${order.delivery_address}`
      const price = `_Ціна (без доставки)_: ${order.stickers_cost} грн`

      return `${title}\n${status}\n${date}\n${stickersCount}\n${deliveryAddress}\n${price}\n\n`
    })
    .join('\n')

  return `
Ось твої замовлення. Надішли мені номер замовлення, яке хочеш скасувати (наприклад, 1) 👇

${ordersMessage}
`
}
