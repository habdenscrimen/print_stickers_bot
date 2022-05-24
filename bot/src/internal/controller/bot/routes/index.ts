import { Router } from '@grammyjs/router'
import { Middleware } from 'grammy'
import { BotContext } from '..'
import { welcome } from './welcome'
import { selectStickers } from './select_stickers'
import { delivery } from './delivery'
import { cancelOrder } from './cancel_order'

export enum Routes {
  Idle = 'idle',
  Welcome = 'welcome',
  SelectStickers = 'select_stickers',
  Delivery = 'delivery',
  RequestContact = 'request_contact',
  Payment = 'payment',
  CancelOrder = 'cancel_order',
}

export type RouteHandler = (nextRoute: Routes) => Middleware<BotContext>

export const router = new Router<BotContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

router.route(Routes.Welcome, welcome(Routes.SelectStickers))
router.route(Routes.SelectStickers, selectStickers(Routes.Delivery))
router.route(Routes.Delivery, delivery(Routes.RequestContact))
router.route(Routes.CancelOrder, cancelOrder(Routes.Idle))