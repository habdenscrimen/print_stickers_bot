import { TelegramStickersServices } from '..'
import { createStickerSet } from './create_sticker_set'
import { deleteStickerSet } from './delete_sticker_set'
import { sendAdminNotification } from './send_admin_notification'

export type TelegramStickersService<HandlerName extends keyof TelegramStickersServices> =
  (
    args: Parameters<TelegramStickersServices[HandlerName]>,
  ) => ReturnType<TelegramStickersServices[HandlerName]>

export const newTelegramStickersServices = (): TelegramStickersServices => {
  return {
    CreateStickerSet: (...args) => createStickerSet(args),
    DeleteStickerSet: (...args) => deleteStickerSet(args),
    SendAdminNotification: (...args) => sendAdminNotification(args),
  }
}
