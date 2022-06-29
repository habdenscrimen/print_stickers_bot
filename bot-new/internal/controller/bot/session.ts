import { User } from 'internal/domain'

export enum SessionSteps {
  FAQ = 'faq',
  MainMenu = 'main-menu',
  SelectStickers = 'select-stickers',
  ConfirmSelectedStickers = 'confirm-selected-stickers',
  RemoveStickerFromOrder = 'remove-sticker-from-order',
  AskPhoneNumber = 'ask-phone-number',
  AskDeliveryInfo = 'ask-delivery-info',
  ConfirmOrder = 'confirm-order',
}

interface SessionUser extends User {}

interface Order {
  stickerSetName: string | undefined
  stickers: {
    sourceFileUniqueID: string // unique id of sticker in the source sticker set
    fileUniqueID: string // unique id of sticker in the bot's sticker set
    sourceFileID: string // file id of sticker in the source sticker set, used for adding sticker to bot's sticker set
  }[]
  deliveryInfo: string | undefined
}

export interface SessionState {
  step: SessionSteps
  user: SessionUser | undefined
  order: Order
}
