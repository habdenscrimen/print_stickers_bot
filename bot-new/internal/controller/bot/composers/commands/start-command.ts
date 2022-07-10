import { SessionSteps } from '../../session'
import { mainMenu, mainMenuText } from '../menus/main-menu'
import { Command } from './types'

export const startCommand: Command = async (ctx) => {
  let logger = ctx.logger.child({ handler: 'start-command' })

  try {
    // set step to MainMenu
    const session = await ctx.session
    session.step = SessionSteps.MainMenu

    // delete order (if exists)
    await ctx.services.Order.DeleteOrder({ ctx })

    // get user data from context
    const { id: userID, first_name, last_name, username } = ctx.from!

    // set user in analytics
    ctx.analytics.setUser({ id: userID, firstName: first_name, lastName: last_name, username })

    // track funnel event
    ctx.analytics.trackEvent('Funnel: Main menu', userID)

    // get user
    const user = await ctx.services.User.GetUserByID({ telegramUserID: userID })
    logger = logger.child({ user })
    logger.debug(`got user`)

    let currentUser = user

    // if no user found, create new user
    if (!currentUser) {
      // get source from url param
      const source = ctx.message?.text.split(' ')[1] || 'unknown'

      currentUser = await ctx.services.User.CreateUser({
        user: {
          telegram_user_id: userID,
          username: ctx.from!.username,
          first_name: ctx.from!.first_name,
          last_name: ctx.from?.last_name,
          source,
        },
      })
      logger = logger.child({ user: currentUser })
      logger.debug(`user created`)

      // set user source in mixpanel
      ctx.analytics.setUser({ id: userID, source })
    }

    // update user in session
    session.user = currentUser

    await ctx.reply(mainMenuText, { reply_markup: mainMenu })
  } catch (error) {
    console.log(error)

    logger = logger.child({ error })
    logger.error(`failed to handle start command`)
  }
}
