export interface User {
  telegram_user_id: number
  username: string
  phone_number: string
  first_name: string
  created_at: string
  last_name?: string
  telegram_sticker_sets?: string[]
}
