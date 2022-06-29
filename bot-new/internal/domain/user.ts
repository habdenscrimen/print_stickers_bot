export interface User {
  telegram_user_id: number

  // personal info
  username: string
  first_name: string
  last_name?: string
  phone_number?: string

  // sticker sets
  telegram_sticker_sets?: string[]

  // timestamps
  created_at: string
}
