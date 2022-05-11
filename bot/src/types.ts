import type { Context, SessionFlavor } from 'grammy'

export enum Routes {
  Idle = 'idle',
  MainMenu = 'main_menu',
  RequestContact = 'request_contact',
  SelectStickers = 'select_stickers',
  ConfirmStickers = 'confirm_stickers',
  Delivery = 'delivery',
}

export interface SessionData {
  route: Routes
}

export type CustomContext = Context & SessionFlavor<SessionData>
