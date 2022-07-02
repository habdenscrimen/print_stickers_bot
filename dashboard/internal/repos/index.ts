import { Order, User } from 'internal/domain'

export interface Repos {
  User: UserRepo
  Order: OrderRepo
}

export interface UserRepo {
  GetUserByID: (options: { userID: number }) => Promise<User | undefined>
}

export interface OrderRepo {
  GetOrders: () => Promise<Order[]>
}

// import { User } from 'internal/domain'

// export interface Repos {
//   User: UserRepo
//   Order: OrderRepo
// }

// interface CreateUserOptions {
//   telegramUserID: number
//   username: string
//   phoneNumber: string
//   firstName: string
//   lastName: string
// }

// export interface UserRepo {
//   GetUserByID: (options: { userID: number }) => Promise<User | undefined>
//   CreateUser: (options: { user: CreateUserOptions }) => Promise<User>
//   SetPhoneNumber: (options: { userID: string; phoneNumber: string }) => Promise<void>
// }

// interface CreateOrderOptions {
//   id: string
//   user_id: number
//   delivery_address: string
//   telegram_sticker_file_ids: string[]
//   telegram_sticker_set_name: string
//   payment: {
//     method: 'nova_poshta'
//   }
//   stickers_cost: number
// }

// export interface OrderRepo {
//   CreateOrder: (options: { order: CreateOrderOptions }) => Promise<void>
// }
