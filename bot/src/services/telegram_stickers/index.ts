import { TelegramServices } from '..'
import { createStickerSet } from './create_sticker_set'
import { deleteStickerSet } from './delete_sticker_set'
import { sendAdminNotification } from './send_admin_notification'

export type TelegramService<HandlerName extends keyof TelegramServices> = (
  args: Parameters<TelegramServices[HandlerName]>,
) => ReturnType<TelegramServices[HandlerName]>

export const newTelegramServices = (): TelegramServices => {
  return {
    CreateStickerSet: (...args) => createStickerSet(args),
    DeleteStickerSet: (...args) => deleteStickerSet(args),
    SendAdminNotification: (...args) => sendAdminNotification(args),
  }
}
