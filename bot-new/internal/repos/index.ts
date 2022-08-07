import { User } from 'internal/domain'
import { PromoCode } from 'internal/domain/promo-code'

export interface Repos {
  User: UserRepo
  Order: OrderRepo
}

interface CreateUserOptions {
  telegramUserID: number
  username: string
  phoneNumber: string
  firstName: string
  lastName: string
  source: string
}

export interface UserRepo {
  GetUserByID: (options: { userID: number }) => Promise<User | undefined>
  // GetUserByData: (data: Partial<User>) => Promise<User | undefined>
  // UpdateUser: (
  //   telegramUserID: number,
  //   user: Partial<User>,
  //   options?: {
  //     incrementFreeStickers?: number
  //     newInvitedUserID?: number
  //     newTelegramStickerSet?: string
  //   },
  // ) => Promise<void>
  CreateUser: (options: { user: CreateUserOptions }) => Promise<User>
  SetPhoneNumber: (options: { userID: string; phoneNumber: string }) => Promise<void>
}

interface CreateOrderOptions {
  id: string
  user_id: number
  delivery_address: string
  telegram_sticker_file_ids: string[]
  telegram_sticker_set_name: string
  payment: {
    method: 'nova_poshta'
  }
  stickers_cost: number
  promo_code?: PromoCode
}

export interface OrderRepo {
  CreateOrder: (options: { order: CreateOrderOptions }) => Promise<void>
}
