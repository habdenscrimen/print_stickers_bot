export interface User {
  telegram_user_id: number
  telegram_chat_id: number

  // personal info
  username?: string
  phone_number?: string
  first_name: string
  last_name?: string

  // sticker sets
  telegram_sticker_sets?: string[]

  // referral info
  referral_code: string
  free_stickers_count?: number
  free_stickers_for_invited_user_ids?: number[]
  invited_by_user_id?: number

  // timestamps
  created_at: string
}
