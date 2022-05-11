import { Router } from '@grammyjs/router'
import { CustomContext } from '../context'
import { Routes } from '../routes'

const router = new Router<CustomContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

router.route(Routes.RequestContact, async (ctx) => {
  await ctx.reply(`Надай свій контакт.`)

  const session = await ctx.session
  session.route = Routes.Idle
})

export { router as requestContactRouter }
