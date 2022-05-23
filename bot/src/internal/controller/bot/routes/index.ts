import { Router } from '@grammyjs/router'
import { Middleware } from 'grammy'
import { BotContext } from '..'
import { welcome } from './welcome'
import { selectStickers } from './select_stickers'

export enum Routes {
  Idle = 'idle',
  Welcome = 'welcome',
  SelectStickers = 'select_stickers',
  Delivery = 'delivery',
}

export type RouteHandler = (nextRoute: Routes) => Middleware<BotContext>

export const router = new Router<BotContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

router.route(Routes.Welcome, welcome(Routes.SelectStickers))
router.route(Routes.SelectStickers, selectStickers(Routes.Delivery))
