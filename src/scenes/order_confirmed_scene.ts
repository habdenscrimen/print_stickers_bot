import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { scenes } from './scenes'

export const orderConfirmedScene = new Scenes.BaseScene<CustomContext>(
  scenes.ORDER_CONFIRMED,
)

// enter the scene
orderConfirmedScene.enter(async (ctx) => {
  console.debug('order confirmed scene: enter')

  // show the message about successfully confirmed order and "Go to start" button
  await ctx.reply(ctx.config.messages.scenes.orderConfirmed.enter, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ctx.config.messages.scenes.orderConfirmed.goToStart,
            callback_data: scenes.START,
          },
        ],
      ],
    },
  })
})

// leave the scene
orderConfirmedScene.leave(async (ctx) => {
  console.debug('order confirmed scene: leave')

  // delete previous message
  await ctx.deleteMessage()
})
