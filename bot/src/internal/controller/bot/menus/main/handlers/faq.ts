import { MenuHandler } from '../..'

export const faq: MenuHandler = async (ctx) => {
  const logger = ctx.logger.child({ name: 'main-menu: FAQ', user_id: ctx.from.id })

  logger.debug('TODO: send FAQ')

  await ctx.editMessageText(`TODO: send FAQ`)
}
