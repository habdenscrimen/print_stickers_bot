export type OrderStatus =
  | 'pending_prepayment'
  | 'confirmed'
  | 'layout_ready'
  | 'printing'
  | 'delivery'
  | 'completed'
  | 'cancelled'

export type OrderEvent = Record<OrderStatus, string>

export interface Order {
  user_id: number
  status: OrderStatus
  delivery_address: string
  telegram_sticker_file_ids: string[]
  layouts_ids?: string[]
  telegram_sticker_set_name?: string
  invited_by_user_id?: number

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
