import { MenuHandler } from '../..'
import { Routes } from '../../../routes'

export const goToFaqMenu: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({ name: 'goToFaqMenu', user_id: ctx.from.id })

  try {
    // change route to Welcome
    const session = await ctx.session
    session.route = Routes.Welcome
    logger.debug('changed route to Welcome')

    const text = ctx.texts.FAQ.Title()
    logger = logger.child({ text })
    logger.debug(`created text`)

    await ctx.editMessageText(text, { parse_mode: 'MarkdownV2' })
    ctx.menu.back()
  } catch (error) {
    logger.error(`failed to navigate to main menu: ${error}`)
  }
}
