export interface User {
  telegram_user_id: number
  username: string
  phone_number: string
  first_name: string
  last_name: string | undefined
  telegram_sticker_sets: string[] | undefined
}
