import { Router } from '@grammyjs/router'
import { CustomContext, Routes } from '../types'

const router = new Router<CustomContext>((ctx) => ctx.session.route)

router.route(Routes.RequestContact, async (ctx) => {
  await ctx.reply(`Надай свій контакт.`)

  ctx.session.route = Routes.Idle
})

export { router as requestContactRouter }
