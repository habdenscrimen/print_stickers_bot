import { Order, OrderStatus, Question, User } from '../domain'

export interface Repos {
  Users: UsersRepo
  Orders: OrdersRepo
  Questions: QuestionsRepo
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
  CreateUser: (telegramUserID: number, user: Partial<User>) => Promise<Partial<User>>
}

export interface OrdersRepo {
  CreateOrder: (order: Omit<Order, 'id' | 'created_at' | 'events'>) => Promise<string>
  AddOrderEvent: (orderID: string, eventType: OrderStatus) => Promise<void>
  GetUserOrders: (userID: number, excludeStatuses?: OrderStatus[]) => Promise<Order[]>
  UpdateOrder: (orderID: string, order: Partial<Order>) => Promise<void>
  GetOrder: (orderID: string) => Promise<Order | undefined>
}

export interface QuestionsRepo {
  CreateQuestion: (
    question: Omit<Question, 'id' | 'created_at' | 'answered_at'>,
  ) => Promise<string>
  GetUnansweredQuestions: () => Promise<Question[]>
  GetQuestion: (options: { questionID: string }) => Promise<Question>
  UpdateQuestion: (options: {
    questionID: string
    question: Partial<Question>
  }) => Promise<void>
}
