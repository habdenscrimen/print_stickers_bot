export interface User {
  telegram_user_id: number
  username: string
  phone_number: string
  first_name: string
  last_name: string | undefined
  sticker_packs: string[] | undefined
}
