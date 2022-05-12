import { Router } from '@grammyjs/router'
import { CustomContext } from '../../context'
import { Routes } from '../../routes'

export const confirmStickersRouter = new Router<CustomContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

confirmStickersRouter.route(Routes.ConfirmStickers, async (ctx) => {
  const logger = ctx.logger.child({ name: Routes.ConfirmStickers })
  logger.debug('entered route')

  await ctx.reply(`HELLO FROM Confirm stickers`)
})
