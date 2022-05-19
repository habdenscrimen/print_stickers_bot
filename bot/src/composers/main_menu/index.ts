import { Composer } from 'grammy'
import { CustomContext } from '../../context'
import { mainMenuRouter } from './router'
import { mainMenu } from './menus'
import { texts } from '../texts'
import { User } from '../../domain'

export const mainMenuComposer = new Composer<CustomContext>()

// use menus
mainMenuComposer.use(mainMenu)

// define commands
mainMenuComposer.command('start', async (ctx) => {
  const logger = ctx.logger.child({ name: 'mainMenu: start' })

  let invitedByName: string | undefined
  let invitedByUserID: number | undefined

  const session = await ctx.session

  // check for referral code
  const referralCode = ctx.match

  // get current user and referral code's owner
  const [currentUser, invitedByUser] = await Promise.all([
    ctx.database.GetUserByID(ctx.from!.id),
    referralCode
      ? ctx.database.GetUserByData({ referral_code: referralCode })
      : Promise.resolve(undefined),
  ])
  logger.debug("got current user and referral code's owner", {
    currentUser,
    invitedByUser,
  })

  if (referralCode) {
    // check that referral code's owner exist and
    // current user is not exist and
    // current user is not referral code's owner
    if (
      invitedByUser &&
      !currentUser &&
      invitedByUser.telegram_user_id !== ctx.from!.id
    ) {
      // save referral code to session
      session.invitedByTelegramUserID = invitedByUser.telegram_user_id

      invitedByUserID = invitedByUser.telegram_user_id

      // set user name to show it to user
      invitedByName = `${invitedByUser.first_name}${
        invitedByUser.last_name ? ` ${invitedByUser.last_name}` : ''
      }`
    }
  }

  // check if current user exist
  if (!currentUser) {
    // create current user in database
    await ctx.database.CreateUser(ctx.from!.id, {
      username: ctx.from?.username,
      first_name: ctx.from?.first_name,
      last_name: ctx.from?.last_name,
      invited_by_user_id: invitedByUserID,
      telegram_chat_id: ctx.chat.id,
    })
    logger.debug('created current user in database')

    // get the newly created user
    const newUser = (await ctx.database.GetUserByID(ctx.from!.id)) as User
    logger.debug('got the newly created user', { newUser })

    // save current user to session
    session.user = newUser
    logger.debug('set current user to session')
  } else {
    session.user = currentUser
  }

  await ctx.reply(texts.greetingWithMenu(invitedByName), {
    reply_markup: mainMenu,
    parse_mode: 'Markdown',
    deleteInFuture: true,
  })
})

// use routers
mainMenuComposer.use(mainMenuRouter)
