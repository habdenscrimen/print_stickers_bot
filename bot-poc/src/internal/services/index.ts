import { Config } from '../../config'
import { BotContext } from '../controller/bot/context'

export interface Services {
  Orders: OrdersService
  Telegram: TelegramService
  Payment: PaymentService
  // User: UserServices
  // Notifications: NotificationsServices
}

export interface PaymentService {
  CreateRefund: (orderID: string) => Promise<void>
  HandleSuccessfulPayment: (options: {
    orderID: string
    transactionID: number
    transactionAmount: number
    providerOrderID: string
  }) => Promise<void>
  HandleSuccessfulRefund: (options: { orderID: string }) => Promise<void>
}

export interface OrderPrice {
  orderPriceLevel: keyof Config['tariffs']
  stickersPrice: number
  deliveryPrice: number
  codPrice: number
  totalPrice: number
}

export interface OrdersService {
  CalculateOrderPrice: (
    ctx: BotContext,
    stickersCount: number,
  ) => Promise<[OrderPrice | null, any]>
  HandleCancellationRequest: (orderID: string, reason: string) => Promise<void>
  AdminCancelOrder: (orderID: string) => Promise<void>
}

export interface TelegramService {
  CreateStickerSet: (userID: number, stickerFileIDs: string[]) => Promise<[string | null, any]>
  DeleteStickerSet: (userID: number, stickerSetName: string) => Promise<void>
}
