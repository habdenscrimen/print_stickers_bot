import {} from 'grammy'
import { CustomContext } from '../context'

export interface Services {
  Telegram: TelegramServices
  Orders: OrdersServices
}

export interface SendAdminNotificationPayloads {
  new_order: {
    stickersCost: number
  }
}

export interface TelegramServices {
  CreateStickerSet: (ctx: CustomContext, stickerFileIDs: string[]) => Promise<string>
  DeleteStickerSet: (ctx: CustomContext, stickerSetName: string) => Promise<void>
  SendAdminNotification: <T extends keyof SendAdminNotificationPayloads>(
    ctx: CustomContext,
    event: T,
    payload: SendAdminNotificationPayloads[T],
  ) => Promise<void>
}

export enum OrderPriceLevel {
  'less_than_6_stickers',
  'less_than_10_stickers',
  'more_than_10_stickers',
  'free_delivery',
}

export interface OrdersServices {
  CalculateOrderPrice: (
    ctx: CustomContext,
    stickersCount: number,
  ) => {
    totalPrice: number
    stickersPrice: number
    stickerCost: number
    orderPriceLevel: OrderPriceLevel
  }
}
