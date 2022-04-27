import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { scenes } from './scenes'

export const deliveryScene = new Scenes.BaseScene<CustomContext>(scenes.DELIVERY)

// enter the scene
deliveryScene.enter(async (ctx) => {
  console.debug('delivery scene: enter')

  // TODO: get price from context
  const price = 200

  await ctx.reply(ctx.config.messages.scenes.confirmStickers.enter, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ctx.config.messages.scenes.delivery.enter(price),
            callback_data: scenes.START,
          },
        ],
        [
          {
            text: ctx.config.messages.scenes.delivery.clearStickers,
            callback_data: scenes.SELECT_STICKERS,
          },
        ],
      ],
    },
  })
})
