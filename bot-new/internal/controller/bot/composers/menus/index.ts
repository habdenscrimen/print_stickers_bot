import { Composer } from 'grammy'
import { BotContext } from '../../context'
import { mainMenu } from './main-menu'

export const menusComposer = new Composer<BotContext>()

menusComposer.use(mainMenu)
