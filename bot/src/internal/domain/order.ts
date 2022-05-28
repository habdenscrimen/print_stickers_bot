export type OrderStatus =
  | 'payment_pending'
  | 'confirmed'
  | 'layout_ready'
  | 'printing'
  | 'delivery'
  | 'completed'
  | 'cancellation_pending'
  | 'cancelled'
  // Failed because the money of this transaction is used to pay for other refund transactions.
  // So the transaction is not refunded and should be refunded manually later (when the debt for refunds is paid).
  | 'refund_failed_wait_reserve'
  // Refund successfully created. LiqPay will refund the money to the customer once the company balance
  // will increase for the amount of the refund transaction.
  | 'refund_success_wait_amount'
  | 'refunded'

export type OrderEvent = Record<OrderStatus, string>

export interface Order {
  id: string
  user_id: number
  status: OrderStatus
  delivery_address: string
  telegram_sticker_file_ids: string[]
  layouts_ids?: string[]
  telegram_sticker_set_name: string
  // invited_by_user_id?: number

  // payment info
  payment?: {
    method?: 'liqpay' | 'nova_poshta'
    provider_transaction_id?: number
    provider_transaction_amount?: number
    provider_order_id?: string
    cancellation_reason?: string
  }

  // cost
  delivery_cost: number
  stickers_cost: number

  // feedback
  feedback?: string
  nps?: number

  // events
  events: OrderEvent[]

  // referral
  by_referral_of_user_id?: number

  // timestamps
  created_at: string
}
