import { Router } from '@grammyjs/router'
import { CustomContext } from '../context'
import { mainMenu } from '../menus'
import { Routes } from '../routes'

const router = new Router<CustomContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

router.route(Routes.MainMenu, async (ctx) => {
  await ctx.reply(`Привіт, ти у головному меню.`, { reply_markup: mainMenu })

  const session = await ctx.session
  session.route = Routes.RequestContact
})

export { router as mainMenuRouter }
