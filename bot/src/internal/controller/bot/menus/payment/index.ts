import { Menu } from '@grammyjs/menu'
import { PaymentMenus } from '..'
import { BotContext } from '../..'
import { Config } from '../../../../../config'
import { paymentUsingBot } from './handlers/payment_using_bot'
import { paymentUsingNovaPoshta } from './handlers/payment_using_nova_poshta'

interface PaymentMenusOptions {
  config: Config
}

export const newPaymentMenus = (options: PaymentMenusOptions): PaymentMenus => {
  return {
    SelectPaymentMethod: selectPaymentMethod(options),
    ChooseNovaPoshtaMethod: chooseNovaPoshtaMethod(options),
    // SelectInBot: selectInBot(options),
  }
}

const selectPaymentMethod = (options: PaymentMenusOptions) => {
  return new Menu<BotContext>('select-payment-method')
    .text(`💳 Оплатити за допомогою бота`, paymentUsingBot)
    .row()
    .text(`🚚 Оплатити на Новій Пошті`, paymentUsingNovaPoshta)
    .row()
}

const chooseNovaPoshtaMethod = (options: PaymentMenusOptions) => {
  return new Menu<BotContext>('select-nova-poshta-payment-method')
    .text(`🚚 Підтверджую замовлення`, paymentUsingNovaPoshta)
    .row()
}
// const selectInBot = (options: PaymentMenusOptions) => {
//   return new Menu<BotContext>('select-payment-method-in-bot').text(
//     `💳 Оплатити за допомогою бота`,
//     paymentUsingBot,
//   )
// }
