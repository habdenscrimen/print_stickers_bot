import {} from 'grammy'
import { CustomContext } from '../context'

export interface Services {
  Telegram: TelegramServices
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
  AddMessagesToDelete: (messageIDs: number[]) => void
  DeleteMessages: (
    ctx: CustomContext,
    chatID: number,
    // funcParallelWithDeletion?: (ctx: CustomContext) => Promise<any>,
    replyParallelWithDeletion?: {
      // func: (ctx: CustomContext) => Promise<any>
      func: (ctx: CustomContext) => ReturnType<CustomContext['reply']>
      addMessageToDelete: boolean
    },
  ) => Promise<void>
}
