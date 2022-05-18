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
    // get user with such referral code
    const user = await ctx.database.GetUserByData({ referral_code: referralCode })

    // check if there's user with such referral code and
    // user is not started bot using their own referral link
    if (user && user.telegram_user_id !== ctx.from!.id) {
      // save referral code to session
      const session = await ctx.session
      session.invitedByTelegramUserID = user.telegram_user_id

      // set user name to show it to user
      invitedByName = `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    }
  }

  // create user in database if it doesn't exist
  const user = await ctx.database.GetUserByID(ctx.from!.id)
  if (!user) {
    await ctx.database.CreateUser(ctx.from!.id, {
      username: ctx.from?.username,
      first_name: ctx.from?.first_name,
      last_name: ctx.from?.last_name,
    })
  }

  await ctx.reply(texts.greetingWithMenu(invitedByName), {
    reply_markup: mainMenu,
    parse_mode: 'Markdown',
    deleteInFuture: true,
  })
})

// use routers
mainMenuComposer.use(mainMenuRouter)
