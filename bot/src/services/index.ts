import { CustomContext } from '../context'

export interface Services {
  TelegramStickers: TelegramStickersServices
}

export interface TelegramStickersServices {
  CreateStickerSet: (ctx: CustomContext, stickerFileIDs: string[]) => Promise<string>
  DeleteStickerSet: (ctx: CustomContext, stickerSetName: string) => Promise<void>
}
