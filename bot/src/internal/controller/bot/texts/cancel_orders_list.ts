import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Order, OrderStatus } from '../../../domain'
import { Text } from './text'

dayjs.extend(utc)
dayjs.extend(timezone)

interface Options {
  orders: Order[]
}

const orderStatuses: Record<OrderStatus, string> = {
  payment_pending: '⏳ Очікує оплати',
  confirmed: `✅ Замовлення сплачено`,
  layout_ready: `🖨 Виготовлення`,
  printing: `🖨 Виготовлення`,
  delivery: `🚚 Доставка`,
  completed: `✅ Замовлення виконано`,
  cancellation_pending: `❌ Створений запит на скасування`,
  cancelled: `❌ Замовлення скасовано`,
  refund_failed_wait_reserve: `❌ Замовлення скасовано, створений запит на повернення коштів`,
  refund_success_wait_amount: `❌ Замовлення скасовано, створений запит на повернення коштів`,
  refunded: `❌ Замовлення скасовано, кошти повернуто`,
}

export const cancelOrdersListText = (options: Options): Text => {
  const { orders } = options

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

  return {
    text: `
Ось твої замовлення. Надішли мені номер замовлення, яке хочеш скасувати (наприклад, 1) 👇

${ordersMessage}
    `,
    parseMode: 'Markdown',
  }
}
