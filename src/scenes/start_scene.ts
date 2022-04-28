import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { scenes } from './scenes'

export const startScene = new Scenes.BaseScene<CustomContext>(scenes.START)

// enter the scene
startScene.enter(async (ctx) => {
  console.debug('start scene: enter')

  await ctx.reply(ctx.config.messages.scenes.start.enter, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Обрати стікери', callback_data: scenes.REQUEST_CONTACT },
          { text: 'У мене є питання', callback_data: scenes.QUESTIONS },
        ],
      ],
    },
  })
})

// leave the scene
startScene.leave(async (ctx) => {
  console.debug('start scene: leave')

  // delete previous message
  await ctx.deleteMessage()
})
