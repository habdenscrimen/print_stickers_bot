import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { scenes } from './scenes'

export const questionsScene = new Scenes.BaseScene<CustomContext>(scenes.QUESTIONS)

// enter the scene
questionsScene.enter(async (ctx) => {
  console.debug('questions scene: enter')

  // show "FAQ" message with "Go back" button
  await ctx.reply(ctx.config.messages.scenes.questions.enter, {
    reply_markup: {
      inline_keyboard: [
        [{ text: ctx.config.messages.goBack, callback_data: scenes.START }],
      ],
    },
  })
})

// leave the scene
questionsScene.leave(async (ctx) => {
  console.debug('questions scene: leave')

  // delete previous message
  await ctx.deleteMessage()
})
