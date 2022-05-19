import {} from 'grammy'
import { CustomContext } from '../context'

export interface Services {
  Telegram: TelegramServices
  Orders: OrdersServices
  User: UserServices
  Notifications: NotificationsServices
}

export interface SendTelegramUserNotificationPayloads {
  new_order_by_your_referral: {
    userID: number
    invitedUserID: number
  }
  you_registered_by_referral: {
    userChatID: number
    invitedByUserID: number
  }
}

export interface SendAdminNotificationPayloads {
  new_order: {
    stickersCost: number
  }
}

export interface NotificationsServices {
  SendAdminNotification: <T extends keyof SendAdminNotificationPayloads>(
    ctx: CustomContext,
    event: T,
    payload: SendAdminNotificationPayloads[T],
  ) => Promise<void>
  SendTelegramUserNotification: <T extends keyof SendTelegramUserNotificationPayloads>(
    ctx: CustomContext,
    event: T,
    payload: SendTelegramUserNotificationPayloads[T],
  ) => Promise<void>
}

export interface UserServices {
  AddFreeStickersForOrderByReferralCode: (
    ctx: CustomContext,
    currentUserID: number,
    invitedByUserID: number,
  ) => Promise<void>
}

export interface TelegramServices {
  CreateStickerSet: (ctx: CustomContext, stickerFileIDs: string[]) => Promise<string>
  DeleteStickerSet: (ctx: CustomContext, stickerSetName: string) => Promise<void>
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
