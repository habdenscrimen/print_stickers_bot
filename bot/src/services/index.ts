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
}
