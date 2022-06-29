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

    // get user
    const userID = ctx.from!.id
    const user = await ctx.services.User.GetUserByID({ telegramUserID: userID })
    logger = logger.child({ user })
    logger.debug(`got user`)

    let currentUser = user

    // if no user found, create new user
    if (!currentUser) {
      currentUser = await ctx.services.User.CreateUser({
        user: {
          telegram_user_id: userID,
          username: ctx.from!.username,
          first_name: ctx.from!.first_name,
          last_name: ctx.from?.last_name,
        },
      })
      logger = logger.child({ user: currentUser })
      logger.debug(`user created`)
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
