export type OrderStatus =
  | 'unconfirmed'
  | 'confirmed'
  | 'print_ready'
  | 'printing'
  | 'delivery'
  | 'completed'
  | 'cancelled'

export interface LayoutSizing {
  gap: number
  avgStickerWidth: number
  maxLayoutWidth: number
}
