import { Composer } from 'grammy'
import { CustomContext } from '../../context'
import { mainMenuRouter } from './router'
import { mainMenu } from './menus'
import { withDeleteMessage } from '../../hof'

export const mainMenuComposer = new Composer<CustomContext>()

// use menus
mainMenuComposer.use(mainMenu)

// define commands
mainMenuComposer.command('start', async (ctx) => {
  await withDeleteMessage(ctx, (ctx) =>
    ctx.reply(`Привіт!\nНадішли мені стікери, які хочеш роздрукувати, а далі я сам`, {
      reply_markup: mainMenu,
    }),
  )
})

// use routers
mainMenuComposer.use(mainMenuRouter)
