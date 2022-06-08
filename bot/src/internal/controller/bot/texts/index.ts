// import { startText } from './start'
// import { selectStickersInstructionsText } from './select_stickers_instruction'
import { gotStickerText } from './got_sticker'
import { stickerAlreadySelectedText } from './sticker_already_selected'
import { animatedStickersNotSupportedText } from './animated_stickers_not_supported'
import { notStickerSelectedText } from './not_sticker_selected'
import { askPhoneNumberText } from './ask_phone_number'
import { successfulPaymentText } from './successful_payment'
import { Config } from '../../../../config'
import { Order } from '../../../domain'
import { OrderPrice } from '../../../services'

export {
  gotStickerText,
  stickerAlreadySelectedText,
  animatedStickersNotSupportedText,
  notStickerSelectedText,
  askPhoneNumberText,
  successfulPaymentText,
}

export interface Texts {
  MainMenu: MainMenuTexts
  Shared: SharedTexts
  SelectStickers: SelectStickersTexts
  Delivery: DeliveryTexts
  Payment: PaymentTexts
  FAQ: FAQTexts
}

export interface TextOptions {
  config: Config
}

export interface MainMenuTexts {
  Start: (options: { invitedByName?: string }) => string
  SelectStickersInstructions: (options: { freeStickersCount?: number }) => string
  ActiveOrdersList: (options: { orders: Order[] }) => string
  CancelOrdersList: (options: { orders: Order[] }) => string
  MyOrders: () => string
}

export interface SharedTexts {
  GoBackToMainMenu: () => string
}

export interface SelectStickersTexts {
  FailedToCreateStickerSet: () => string
  ConfirmSelectedStickers: () => string
  MotivateToSelectMoreStickers: (options: {
    stickersCount: number
    orderPrice: OrderPrice
  }) => string
}

export interface DeliveryTexts {
  AskDeliveryInfo: () => string
}

export interface PaymentTexts {
  SuccessOrderWithoutPayment: () => string
  SelectPaymentMethod: (options: {
    novaPoshtaAvailable: boolean
    orderPrice: OrderPrice
  }) => string
  CanceledOrder: () => string
}

export interface FAQTexts {
  Title: () => string
  HowLongIsOrderProcessing: () => string
  CanCancelOrder: () => string
  AskQuestion: () => string
  AskQuestionSuccess: () => string
}

export const escapeMarkdown = (text: string): string => {
  return (
    text
      .replace(/\(/gm, '\\(')
      .replace(/\)/gm, '\\)')
      .replace(/\./gm, '\\.')
      .replace(/\:/gm, '\\:')
      .replace(/\-/gm, '\\-')
      .replace(/\!/gm, '\\!')
      .replace(/\#/gm, '\\#')
      .replace(/\>/gm, '\\>')
      // fix link in markdown
      .replace(/]\\\(/gm, '](')
      .replace(
        /\\_by\\_print\\_stickers\\_ua\\_bot\\\)/gm,
        '\\_by\\_print\\_stickers\\_ua\\_bot)',
      )
  )
}
