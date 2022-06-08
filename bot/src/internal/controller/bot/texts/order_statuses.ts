import { OrderStatus } from '../../../domain'

export const orderStatuses: Record<OrderStatus, string> = {
  payment_pending: '⏳ Очікує оплати',
  confirmed: `➕ Нове замовлення`,
  layout_ready: `🖨 Виготовляється`,
  printing: `🖨 Виготовляється`,
  delivery: `🚚 Доставляється`,
  completed: `✅ Замовлення виконано`,
  cancellation_pending: `❌ Створений запит на скасування`,
  cancelled: `❌ Замовлення скасовано`,
  refund_failed_wait_reserve: `❌ Замовлення скасовано, створений запит на повернення коштів`,
  refund_success_wait_amount: `❌ Замовлення скасовано, створений запит на повернення коштів`,
  refunded: `❌ Замовлення скасовано, кошти повернуто`,
}
