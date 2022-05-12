import { Menu } from '@grammyjs/menu'
import { CustomContext } from '../../context'
import { Routes } from '../../routes'

export const mainMenu = new Menu<CustomContext>('main_menu')
  .text('Обрати стікери', async (ctx) => {
    const session = await ctx.session
    session.route = Routes.SelectStickers

    await ctx.reply(`Супер! Надішли мені потрібні стікери`)
  })
  .text('FAQ', async (ctx) => {
    await ctx.reply('Ти нажав на FAQ')
  })
