import { Menu } from '@grammyjs/menu'
import { CustomContext, Routes } from '../types'

export const mainMenu = new Menu<CustomContext>('main_menu')
  .text('Надати контакт', async (ctx) => {
    const session = await ctx.session
    session.route = Routes.RequestContact

    ctx.menu.close()
  })
  .text('FAQ', (ctx) => ctx.reply('Перекидую тебе на роут для FAQ.'))
