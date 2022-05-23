import { MenuFlavor } from '@grammyjs/menu'
import { Filter, Middleware } from 'grammy'
import { BotContext } from '..'
import { mainMenu } from './main'
import { selectStickersDoneMenu } from './select_stickers_done'
import { confirmSelectStickersDoneMenu } from './confirm_select_stickers_done'
import { confirmStickerSet } from './confirm_sticker_set'
import { selectPaymentMethod } from './select_payment_method'

type MenuHandler = Middleware<Filter<BotContext, 'callback_query:data'> & MenuFlavor>

// @ts-expect-error
export type Ctx = Parameters<MenuHandler>['0']

export const menus = {
  mainMenu,
  selectStickersDoneMenu,
  confirmSelectStickersDoneMenu,
  confirmStickerSet,
  selectPaymentMethod,
}
