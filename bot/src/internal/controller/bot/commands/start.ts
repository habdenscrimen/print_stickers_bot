import { Command } from '.'
import { goLike } from '../../../../pkg/function_exec'
import { User } from '../../../domain'

export const start: Command = async (ctx) => {
  let logger = ctx.logger.child({ name: 'start-command', user_id: ctx.from!.id })

  // get session
  const session = await ctx.session

  // try to get referral code
  const referralCode = ctx.match

  // get current user and referral code's owner
  const [[currentUser, invitedByUser], getUsersError] = await goLike(
    Promise.all([
      ctx.repos.Users.GetUserByID(ctx.from!.id),
      referralCode
        ? ctx.repos.Users.GetUserByData({ referral_code: referralCode })
        : Promise.resolve(undefined),
    ]),
  )
  if (getUsersError) {
    logger.error(`failed to get current user and referral code's owner`, { err: getUsersError })
    return
  }
  logger = logger.child({ currentUser, invitedByUser })
  logger.debug('got current user and referral code owner')

  let invitedByName: string | undefined
  let invitedByUserID: number | undefined

  if (
    // check that referral code passed
    referralCode &&
    // check that referral code's owner exist
    invitedByUser &&
    // check that current user is not exist
    !currentUser &&
    // check that current user is not referral code's owner
    invitedByUser.telegram_user_id !== ctx.from!.id
  ) {
    // save invited by user id to session
    session.order.invitedByTelegramUserID = invitedByUser.telegram_user_id

    invitedByUserID = invitedByUser.telegram_user_id

    // set user name to show it to user
    invitedByName = `${invitedByUser.first_name}${
      invitedByUser.last_name ? ` ${invitedByUser.last_name}` : ''
    }`
    session.invitedByUserName = invitedByName
  }

  if (currentUser) {
    // save current user to session
    session.user = currentUser

    const text = ctx.texts.MainMenu.Start({
      invitedByName: ctx.config.features.referralProgram ? invitedByName : undefined,
    })
    await ctx.reply(text, { reply_markup: ctx.menus.Main.Main, parse_mode: 'MarkdownV2' })

    logger.debug('current user exists, saved to session')
    return
  }

  // create current user in database
  const [_, createUserError] = await goLike(
    ctx.repos.Users.CreateUser(ctx.from!.id, {
      username: ctx.from?.username,
      first_name: ctx.from?.first_name,
      last_name: ctx.from?.last_name,
      invited_by_user_id: invitedByUserID,
      telegram_chat_id: ctx.chat.id,
    }),
  )
  if (createUserError) {
    logger.error(`failed to create user in database`, {
      err: createUserError,
      id: ctx.from!.id,
    })
    return
  }
  logger = logger.child({ userID: ctx.from!.id })
  logger.debug('created user in database')

  // get the newly created user
  const [newUser, getUserError] = await goLike(ctx.repos.Users.GetUserByID(ctx.from!.id))
  if (getUserError) {
    logger.error(`failed to get newly created user`, { err: getUserError, id: ctx.from!.id })
    return
  }
  logger = logger.child({ newUser })
  logger.debug('got the newly created user')

  // save current user to session
  session.user = newUser
  logger.debug('set current user to session')

  const text = ctx.texts.MainMenu.Start({
    invitedByName: ctx.config.features.referralProgram ? invitedByName : undefined,
  })
  await ctx.reply(text, { reply_markup: ctx.menus.Main.Main, parse_mode: 'MarkdownV2' })
}

export const startWithoutReferral: Command = async (ctx) => {
  let logger = ctx.logger.child({ name: 'start-command' })

  try {
    // get user id
    const userID = ctx.from!.id
    logger = logger.child({ user_id: userID })
    logger.debug(`got user id`)

    // get session
    const session = await ctx.session

    // get current user from database
    const user = await ctx.services.User.GetUserByID({ telegramUserID: userID })

    let currentUser = user

    // check if no user found
    if (!user) {
      logger.debug(`user not found, creating a new user in database`)

      // create a new user in database if not found
      const newUser = await ctx.services.User.CreateUser({
        telegramUserID: userID,
        user: {
          username: ctx.from?.username,
          first_name: ctx.from?.first_name,
          last_name: ctx.from?.last_name,
          telegram_chat_id: ctx.chat.id,
        },
      })
      logger = logger.child({ new_user: newUser })
      logger.debug(`created a new user in database`)

      currentUser = newUser as User
    }

    // update user in session
    session.user = currentUser

    // reply with start message
    const text = ctx.texts.MainMenu.Start({})
    await ctx.reply(text, { reply_markup: ctx.menus.Main.Main, parse_mode: 'MarkdownV2' })
  } catch (error) {
    logger.error(`failed to handle start command: ${error}`)
  }
}
