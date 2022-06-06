import { MenuHandler } from '../..'
import { Routes } from '../../../routes'

export const selectStickers: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({ name: 'main-menu: Select stickers', user_id: ctx.from.id })

  // change route to SelectStickers
  const session = await ctx.session
  session.route = Routes.SelectStickers
  logger.debug('changed route to SelectStickers')

  ctx.menu.nav('select-stickers')

  // get fresh user object with updated free stickers count
  const user = await ctx.repos.Users.GetUserByID(ctx.from.id)
  if (!user) {
    logger.error(`failed to get user with id ${ctx.from.id}`)
    throw new Error(`failed to get user with id ${ctx.from.id}`)
  }
  logger = logger.child({ user })

  const text = ctx.texts.MainMenu.SelectStickersInstructions({
    freeStickersCount: user.free_stickers_count,
  })

  // send message with info that user can send stickers now
  await ctx.editMessageText(text, {
    parse_mode: 'MarkdownV2',
    deleteInFuture: true,
    disable_web_page_preview: true,
  })

  logger.debug('sent message that user can send stickers')
}
