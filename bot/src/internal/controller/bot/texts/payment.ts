import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { escapeMarkdown, PaymentTexts, TextOptions } from '.'

dayjs.extend(utc)
dayjs.extend(timezone)

type Text<TextName extends keyof PaymentTexts> = (
  options: TextOptions,
  args: Parameters<PaymentTexts[TextName]>,
) => ReturnType<PaymentTexts[TextName]>

export const newPaymentTexts = (options: TextOptions): PaymentTexts => {
  return {
    SuccessOrderWithoutPayment: (...args) =>
      escapeMarkdown(successOrderWithoutPayment(options, args)),
    SelectPaymentMethod: (...args) => escapeMarkdown(selectPaymentMethod(options, args)),
    CanceledOrder: (...args) => escapeMarkdown(canceledOrder(options, args)),
  }
}

const canceledOrder: Text<'CanceledOrder'> = () => {
  return `
Замовлення скасоване, повертаємось у головне меню 👇
  `
}

const successOrderWithoutPayment: Text<'SuccessOrderWithoutPayment'> = ({ config }) => {
  return `
✅ Замовлення успішно оформлене і буде відправлено до кінця наступного робочого тижня.

ℹ️ Ви можете переглянути статус замовлення на сторінці “✉️ *Мої замовлення*”.

А зараз повертаємось у головне меню 👇
  `
}

const selectPaymentMethod: Text<'SelectPaymentMethod'> = (
  { config },
  [{ novaPoshtaAvailable, orderPrice }],
) => {
  if (!config.features.liqPay) {
    return `
🚚 Оплатити замовлення можна при отриманні на Новій Пошті.

👉 Вартість замовлення: *${orderPrice.stickersPrice}* грн
👉 Вартість доставки: *${orderPrice.codPrice}* грн. (*${orderPrice.codPoshtomatPrice}* грн. при доставці у поштомат)
    `
  }

  if (!novaPoshtaAvailable) {
    return `На жаль, замовлення на таку суму (${orderPrice.stickersPrice} грн) не може бути виконане без передоплати.`
  }

  return `
Оберіть спосіб оплати (від цього залежить вартість доставки).

💳 *Оплата за допомогою бота (картка або Apple/Google Pay)*
    👉 Вартість доставки буде *${orderPrice.deliveryPrice}* грн.
    👉 Оплата здійснюється за допомогою українського сервісу LiqPay (від Приват24). Ні Телеграм, ні бот не мають доступу до даних картки.
    👉 Оплатити можна карткою будь-якого українського банку.
    ℹ️ ___Це рекомендований спосіб оплати_\r__.


🚚 *Оплата при отриманні на Новій Пошті*
    👉 Вартість доставки буде *${orderPrice.codPrice}* грн (через комісію Нової Пошти).


ℹ️ У обох варіантах можливе повернення коштів при скасуванні замовлення.
    `
}
