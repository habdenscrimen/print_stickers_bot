import { Composer } from 'grammy'
import { CustomContext } from '../../context'
import { confirmStickersRouter } from './router'
// import { mainMenu } from './menus'

export const confirmStickersComposer = new Composer<CustomContext>()

// // use menus
// confirmStickersComposer.use(mainMenu)

// // define commands
// confirmStickersComposer.command('start', async (ctx) => {
//   await ctx.reply(`Привіт!\nНадішли мені стікери, які хочеш роздрукувати, а далі я сам`, {
//     reply_markup: mainMenu,
//   })
// })

// use routers
confirmStickersComposer.use(confirmStickersRouter)

// mainMenuComposer.use(async (ctx) => {
//   await ctx.reply(`Надішли мені стікери, які хочеш роздрукувати, а далі я сам`, {
//     reply_markup: mainMenu,
//   })
// })
