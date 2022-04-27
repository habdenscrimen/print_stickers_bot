import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { scenes } from './scenes'

export const selectStickersScene = new Scenes.BaseScene<CustomContext>(
  scenes.SELECT_STICKERS,
)

// enter the scene
selectStickersScene.enter(async (ctx) => {
  console.debug('select stickers scene: enter')

  // TODO: delete existing sticker set created by the bot

  // show "Select stickers" message with "Go back" button
  await ctx.reply(ctx.config.messages.scenes.selectStickers.enter, {
    reply_markup: {
      inline_keyboard: [
        [{ text: ctx.config.messages.goBack, callback_data: scenes.START }],
      ],
    },
  })
})

// handle getting sticker
selectStickersScene.on('sticker', async (ctx) => {
  try {
    console.debug(`select stickers scene: got sticker`)

    // TODO: check for duplicated sticker

    // TODO: delete previous message (bot's message with button)

    // confirm getting sticker
    await ctx.reply(ctx.config.messages.scenes.selectStickers.gotSticker, {
      // add `finish` button
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.config.messages.scenes.selectStickers.finish,
              callback_data: scenes.CONFIRM_STICKERS,
            },
          ],
        ],
      },
    })
  } catch (error) {
    console.error(`Failed to handle sticker message: ${error}`)
  }
})

// leave the scene
selectStickersScene.leave(async (ctx) => {
  console.debug('select stickers scene: leave')

  // delete previous message
  await ctx.deleteMessage()
})
