import { OrderPrice } from '../../../services'
import { Text } from './text'

interface Options {
  novaPoshtaAvailable: boolean
  orderPrice: OrderPrice
}

export const paymentMethodInfoText = (options: Options): Text => {
  const { novaPoshtaAvailable, orderPrice } = options

  if (!novaPoshtaAvailable) {
    return {
      text: `На жаль, замовлення на таку суму (${orderPrice.stickersPrice} грн) не може бути виконане без передоплати.`,
      parseMode: 'Markdown',
    }
  }

  return {
    text: `
Обери спосіб оплати (від цього залежить вартість доставки).

💳 *Оплата за допомогою бота (картка або Apple/Google Pay)*
    👉 Вартість доставки буде *${orderPrice.deliveryPrice}* грн.
    👉 Оплата здійснюється за допомогою українського сервісу LiqPay (від Приват24). Ні Телеграм, ні бот не мають доступу до даних картки.
    👉 Оплатити можна карткою будь-якого українського банку.
    ℹ️ ___Це рекомендований спосіб оплати_\r__.


🚚 *Оплата при отриманні на Новій Пошті*
    👉 Вартість доставки буде *${orderPrice.codPrice}* грн (через комісію Нової Пошти).


ℹ️ У обох варіантах можливе повернення коштів при скасуванні замовлення.
    `
      .replace(/\(/gm, '\\(')
      .replace(/\)/gm, '\\)')
      .replace(/\./gm, '\\.')
      .replace(/\:/gm, '\\:')
      .replace(/\-/gm, '\\-'),
    parseMode: `MarkdownV2`,
  }

  //   return {
  //     text: `
  // ✅ Отримав (всього ${stickersCount})
  // Продовжуй надсилати наліпки 👇
  //   `,
  //     parseMode: 'Markdown',
  //   }
}
