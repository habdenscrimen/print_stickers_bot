import { Config } from '../../config'
import { Order, User } from '../domain'

export interface Services {
  Orders: OrdersService
  Telegram: TelegramService
  Payment: PaymentService
  User: UserService
  Notification: NotificationService
}

export interface UserService {
  UpdateUser: (options: {
    telegramUserID: number
    user: Partial<User>
    options?: {
      incrementFreeStickers?: number
      newInvitedUserID?: number
      newTelegramStickerSet?: string
    }
  }) => Promise<void>
}

export interface AdminNotificationPayloads {
  new_order: {
    orderID: string
  }
  order_cancelled: {
    orderID: string
  }
  order_cancellation_requested: {
    orderID: string
  }
  order_cannot_be_refunded: {
    orderID: string
  }
}

export interface UserNotificationPayloads {
  order_refunded: {
    telegramChatID: number
    orderID: string
  }
  admin_cancelled_order: {
    telegramChatID: number
    orderID: string
  }
  order_by_your_referral_code: {
    telegramChatID: number
    orderID: string
  }
}

export interface NotificationPayload {
  admin?: {
    event: keyof AdminNotificationPayloads
    payload: AdminNotificationPayloads[keyof AdminNotificationPayloads]
  }
  user?: {
    event: keyof UserNotificationPayloads
    payload: UserNotificationPayloads[keyof UserNotificationPayloads]
  }
}

export interface NotificationService {
  AddNotification: (payload: NotificationPayload) => Promise<void>
  SendNotification: (payload: NotificationPayload) => Promise<void>
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
  freeStickersUsed: number
  freeStickersLeft: number
}

export interface OrdersService {
  CreateOrder: (order: Omit<Order, 'id' | 'created_at' | 'events'>) => Promise<string>
  CalculateOrderPrice: (options: {
    userID: number
    stickersCount: number
  }) => Promise<OrderPrice>
  HandleCancellationRequest: (orderID: string, reason: string) => Promise<void>
  AdminCancelOrder: (orderID: string) => Promise<void>
}

export interface TelegramService {
  CreateStickerSet: (userID: number, stickerFileIDs: string[]) => Promise<[string | null, any]>
  DeleteStickerSet: (userID: number, stickerSetName: string) => Promise<void>
  SendMessage: (chatID: number, text: string) => Promise<void>
}
