import { MenuHandler } from '../..'
import { Routes } from '../../../routes'

export const goToMainMenu: MenuHandler = async (ctx) => {
  const logger = ctx.logger.child({ name: 'select-stickers: Go back', user_id: ctx.from.id })

  try {
    // change route to Welcome
    const session = await ctx.session
    session.route = Routes.Welcome
    logger.debug('changed route to Welcome')

    const text = ctx.texts.MainMenu.Start({
      invitedByName: ctx.config.features.referralProgram
        ? session.invitedByUserName
        : undefined,
    })
    await ctx.editMessageText(text, { parse_mode: 'MarkdownV2' })
    ctx.menu.back()
  } catch (error) {
    logger.error(`failed to navigate to main menu: ${error}`)
  }
}
