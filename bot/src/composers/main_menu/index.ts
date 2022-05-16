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
  await ctx.reply(texts.greetingWithMenu, {
    reply_markup: mainMenu,
    deleteInFuture: true,
  })
})

// use routers
mainMenuComposer.use(mainMenuRouter)
