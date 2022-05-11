import { Router } from '@grammyjs/router'
import { mainMenu } from '../menus'
import { CustomContext, Routes } from '../types'

const router = new Router<CustomContext>((ctx) => ctx.session.route)

router.route(Routes.MainMenu, async (ctx) => {
  await ctx.reply(`Привіт, ти у головному меню.`, { reply_markup: mainMenu })

  // ctx.session.route = Routes.RequestContact
})

export { router as mainMenuRouter }
