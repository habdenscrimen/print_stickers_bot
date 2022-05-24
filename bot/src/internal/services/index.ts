import { Config } from '../../config'
import { BotContext } from '../controller/bot'

export interface Services {
  Orders: OrdersService
  Telegram: TelegramService
  Payment: PaymentService
  // User: UserServices
  // Notifications: NotificationsServices
}

export interface PaymentService {
  CreateRefund: (ctx: BotContext, orderID: string) => Promise<void>
}

export interface OrdersService {
  CalculateOrderPrice: (
    ctx: BotContext,
    stickersCount: number,
  ) => Promise<
    [
      {
        orderPriceLevel: keyof Config['tariffs']
        stickersPrice: number
        deliveryPrice: number
        totalPrice: number
      } | null,
      any,
    ]
  >
  HandleCancellationRequest: (ctx: BotContext, orderID: string, reason: string) => Promise<void>
}

export interface TelegramService {
  CreateStickerSet: (ctx: BotContext, stickerFileIDs: string[]) => Promise<[string | null, any]>
  DeleteStickerSet: (ctx: BotContext, stickerSetName: string, userID: number) => Promise<void>
}
