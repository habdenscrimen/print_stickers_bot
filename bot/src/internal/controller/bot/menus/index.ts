import { Menu, MenuFlavor } from '@grammyjs/menu'
import { Filter, Middleware } from 'grammy'
import { BotContext } from '..'

export type MenuHandler = Middleware<Filter<BotContext, 'callback_query:data'> & MenuFlavor>

// @ts-expect-error
export type Ctx = Parameters<MenuHandler>['0']

export type BotMenu = Menu<BotContext>

export interface Menus {
  Main: MainMenus
  SelectStickers: SelectStickersMenus
  Payment: PaymentMenus
}

export interface MainMenus {
  Main: BotMenu
}

export interface SelectStickersMenus {
  FinishSelectingStickers: BotMenu
  Done: BotMenu
  ConfirmStickerSet: BotMenu
}

export interface PaymentMenus {
  SelectPaymentMethod: BotMenu
  ChooseNovaPoshtaMethod: BotMenu
  // SelectInBot: BotMenu
}
