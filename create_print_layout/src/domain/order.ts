export type OrderStatus =
  | 'confirmed'
  | 'layout_ready'
  | 'printing'
  | 'delivery'
  | 'completed'
  | 'cancelled'

export type OrderEventType =
  | 'confirmed'
  | 'layout_ready'
  | 'printing'
  | 'delivery'
  | 'completed'
  | 'cancelled'

export type OrderEvent = Record<OrderEventType, string>

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

  // timestamps
  created_at: string
}
