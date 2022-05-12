export type OrderStatus =
  | 'unconfirmed'
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
  sticker_file_ids: string[]
  layouts_ids?: string[]
  stickerSetName?: string
}
