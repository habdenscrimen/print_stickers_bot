import { Text } from './text'

export const successfulOrderWithoutPaymentText = (): Text => {
  return {
    text: `
✅ Замовлення успішно оформлене і буде відправлено до кінця наступного робочого тижня.

ℹ️ Ти можеш переглянути статус замовлення на сторінці “✉️ *Мої замовлення*”.

А зараз повертаємось у головне меню 👇
`,
    parseMode: 'Markdown',
  }
}
