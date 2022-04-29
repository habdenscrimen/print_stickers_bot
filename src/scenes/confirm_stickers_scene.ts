import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { scenes } from './scenes'

export const confirmStickersScene = new Scenes.BaseScene<CustomContext>(
  scenes.CONFIRM_STICKERS,
)

// enter the scene
confirmStickersScene.enter(async (ctx) => {
  console.debug('confirm stickers scene: enter')

  // TODO: show temp sticker set created by the bot

  await ctx.reply(ctx.config.messages.scenes.confirmStickers.checkStickerpack, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `Стікерпак`,
            url: `https://t.me/addstickers/${ctx.session.stickerSetName}`,
          },
        ],
      ],
    },
  })

  // ask user to confirm stickers and show 2 buttons: "Confirm" and "Cancel"
  await ctx.reply(ctx.config.messages.scenes.confirmStickers.aftercheckStickerpack, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ctx.config.messages.scenes.confirmStickers.confirmStickers,
            callback_data: scenes.DELIVERY,
          },
        ],
        [
          {
            text: ctx.config.messages.scenes.confirmStickers.clearStickers,
            callback_data: scenes.START,
          },
        ],
      ],
    },
  })
})

// leave the scene
confirmStickersScene.leave(async (ctx) => {
  console.debug('confirm stickers scene: leave')

  // delete previous message
  await ctx.deleteMessage()
})
