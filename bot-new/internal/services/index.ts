import { BotContext } from 'internal/controller/bot/context'
import { User } from 'internal/domain'
import { PromoCode } from 'internal/domain/promo-code'

export interface Services {
  // Orders: OrdersService
  // Telegram: TelegramService
  // Payment: PaymentService
  User: UserService
  Order: OrderService
  // Notification: NotificationService
  // Question: QuestionService
}

export interface UserService {
  GetUserByID: (options: { telegramUserID: number }) => Promise<User | undefined>
  CreateUser: (options: { user: Partial<User> }) => Promise<User>
  IsContactSaved: (options: { ctx: BotContext }) => Promise<boolean>
  SaveContact: (options: { ctx: BotContext }) => Promise<void>
}

export interface OrderService {
  IsStickerDuplicate: (options: { ctx: BotContext }) => Promise<boolean>
  AddSticker: (options: { ctx: BotContext }) => Promise<{ stickerSetName: string }>
  DeleteSticker: (options: { ctx: BotContext; fileID: string }) => Promise<void>
  DeleteOrder: (options: { ctx: BotContext }) => Promise<void>
  GetOrderInfo: (options: { ctx: BotContext }) => Promise<{
    stickerCost: number
    stickersCount: number
    price: number
    promoCode: PromoCode | undefined
  }>
  SaveDeliveryInfo: (options: { ctx: BotContext }) => Promise<void>
  CreateOrder: (options: { ctx: BotContext }) => Promise<void>
}
