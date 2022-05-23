import { Config } from '../../config'
import { BotContext } from '../controller/bot'

export interface Services {
  Orders: OrdersService
  Telegram: TelegramService
  // User: UserServices
  // Notifications: NotificationsServices
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
}

export interface TelegramService {
  CreateStickerSet: (ctx: BotContext, stickerFileIDs: string[]) => Promise<[string | null, any]>
  DeleteStickerSet: (ctx: BotContext, stickerSetName: string) => Promise<any>
}
