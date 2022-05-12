import { TelegramStickersServices } from '..'
import { createStickerSet } from './create_sticker_set'

export type TelegramStickersService<HandlerName extends keyof TelegramStickersServices> =
  (
    args: Parameters<TelegramStickersServices[HandlerName]>,
  ) => ReturnType<TelegramStickersServices[HandlerName]>

export const newTelegramStickersServices = (): TelegramStickersServices => {
  return {
    CreateStickerSet: (...args) => createStickerSet(args),
  }
}
