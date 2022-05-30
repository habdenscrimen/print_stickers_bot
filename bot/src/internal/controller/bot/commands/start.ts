import { Command } from '.'
import { goLike } from '../../../../pkg/function_exec'
import { mainMenu } from '../menus/main'
import { startText } from '../texts'

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
  }

  if (currentUser) {
    // save current user to session
    session.user = currentUser

    await ctx.reply(createGreetingMessage(invitedByName), {
      reply_markup: mainMenu,
      parse_mode: 'Markdown',
    })

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

  await ctx.reply(createGreetingMessage(invitedByName), {
    reply_markup: mainMenu,
    parse_mode: 'Markdown',
  })
}

/* messages */

const createGreetingMessage = (invitedByName?: string) => {
  const invitedMessage = invitedByName
    ? `Тебе запросив(ла) ${invitedByName}. Як тільки ти зробиш перше замовлення, ви удвох отримаєте по 3 безкоштовних стікера 🔥\n\n`
    : ''

  return startText.text
}
