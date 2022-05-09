export type OrderStatus =
  | 'unconfirmed'
  | 'confirmed'
  | 'print_ready'
  | 'layout_ready'
  | 'printing'
  | 'delivery'
  | 'completed'
  | 'cancelled'

export interface Order {
  user_id: number
  status: OrderStatus
  delivery_address: string
  layouts_ids: string[]
}

export interface LayoutSizing {
  gap: number
  avgStickerWidth: number
  maxLayoutWidth: number
}
