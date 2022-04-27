import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { scenes } from './scenes'

export const confirmStickersScene = new Scenes.BaseScene<CustomContext>(
  scenes.CONFIRM_STICKERS,
)

// enter the scene
confirmStickersScene.enter(async (ctx) => {
  console.debug('confirm stickers scene: enter')

  await ctx.reply(ctx.config.messages.scenes.confirmStickers.enter)
})
