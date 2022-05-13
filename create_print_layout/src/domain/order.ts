export type OrderStatus =
  | 'confirmed'
  | 'layout_ready'
  | 'printing'
  | 'delivery'
  | 'completed'
  | 'cancelled'

export interface Order {
  user_id: number
  status: OrderStatus
  delivery_address: string
  telegram_sticker_file_ids: string[]
  layouts_ids?: string[]
  telegram_sticker_set_name?: string
}
