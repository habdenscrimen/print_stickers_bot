export type OrderStatus =
  | 'payment_pending'
  | 'confirmed'
  | 'layout_ready'
  | 'printing'
  | 'delivery'
  | 'completed'
  | 'cancellation_pending'
  | 'cancelled'
  | 'refund_failed_wait_reserve'
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
    provider_transaction_id?: number
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
