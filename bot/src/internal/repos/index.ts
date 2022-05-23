import { Order, OrderStatus, User } from '../domain'

export interface Repos {
  Users: UsersRepo
  Orders: OrdersRepo
}

export interface UsersRepo {
  GetUserByID: (userID: number) => Promise<User | undefined>
  GetUserByData: (data: Partial<User>) => Promise<User | undefined>
  UpdateUser: (
    telegramUserID: number,
    user: Partial<User>,
    options?: {
      incrementFreeStickers?: number
      newInvitedUserID?: number
      newTelegramStickerSet?: string
    },
  ) => Promise<void>
  CreateUser: (telegramUserID: number, user: Partial<User>) => Promise<void>
}

export interface OrdersRepo {
  CreateOrder: (order: Omit<Order, 'created_at' | 'events'>) => Promise<string>
  AddOrderEvent: (orderID: string, eventType: OrderStatus) => Promise<void>
  GetUserOrders: (userID: number, excludeStatuses?: OrderStatus[]) => Promise<Order[]>
  UpdateOrder: (orderID: string, order: Partial<Order>) => Promise<void>
}
