import { Composer } from 'grammy'
import { CustomContext } from '../../context'
import { mainMenuRouter } from './router'
import { mainMenu } from './menus'
import { texts } from '../texts'

export const mainMenuComposer = new Composer<CustomContext>()

// use menus
mainMenuComposer.use(mainMenu)

// define commands
mainMenuComposer.command('start', async (ctx) => {
  let invitedByName: string | undefined

  // check for referral code
  const referralCode = ctx.match
  if (referralCode) {
    // get current user and referral code's owner
    const [currentUser, invitedByUser] = await Promise.all([
      ctx.database.GetUserByID(ctx.from!.id),
      ctx.database.GetUserByData({ referral_code: referralCode }),
    ])

    // check that referral code's owner exist and
    // current user is not exist and
    // current user is not referral code's owner
    if (
      invitedByUser &&
      !currentUser &&
      invitedByUser.telegram_user_id !== ctx.from!.id
    ) {
      // save referral code to session
      const session = await ctx.session
      session.invitedByTelegramUserID = invitedByUser.telegram_user_id

      // create current user in database
      await ctx.database.CreateUser(ctx.from!.id, {
        username: ctx.from?.username,
        first_name: ctx.from?.first_name,
        last_name: ctx.from?.last_name,
        invited_by_user_id: invitedByUser.telegram_user_id,
      })

      // set user name to show it to user
      invitedByName = `${invitedByUser.first_name}${
        invitedByUser.last_name ? ` ${invitedByUser.last_name}` : ''
      }`
    }
  }

  await ctx.reply(texts.greetingWithMenu(invitedByName), {
    reply_markup: mainMenu,
    parse_mode: 'Markdown',
    deleteInFuture: true,
  })
})

// use routers
mainMenuComposer.use(mainMenuRouter)
