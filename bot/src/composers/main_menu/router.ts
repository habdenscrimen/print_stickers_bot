import { Router } from '@grammyjs/router'
import { CustomContext } from '../../context'
import { Routes } from '../../routes'
import { mainMenu } from './menus'

export const mainMenuRouter = new Router<CustomContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

mainMenuRouter.route(Routes.MainMenu, async (ctx) => {
  const logger = ctx.logger.child({ name: Routes.MainMenu })
  logger.debug('entered route')

  await ctx.reply(`Надішли мені стікери, які хочеш роздрукувати, а далі я сам`, {
    reply_markup: mainMenu,
  })
})
