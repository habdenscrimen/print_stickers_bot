import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { updateOrder } from '../firebase_database'
import { scenes } from './scenes'

export const orderConfirmedScene = new Scenes.BaseScene<CustomContext>(
  scenes.ORDER_CONFIRMED,
)

// enter the scene
orderConfirmedScene.enter(async (ctx) => {
  console.debug('order confirmed scene: enter')

  // update order status to 'confirmed'
  await updateOrder(ctx.database, ctx.session.databaseOrderID, { status: 'confirmed' })

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

  // get temp sticker set
  const stickerSet = await ctx.telegram.getStickerSet(ctx.session.stickerSetName)

  // delete all stickers from temp sticker set
  const deleteStickersPromises = stickerSet.stickers.map((sticker) =>
    ctx.telegram.deleteStickerFromSet(sticker.file_id),
  )

  await Promise.all(deleteStickersPromises)

  // clear sticker set name
  ctx.session.stickerSetName = ''
  ctx.session.stickerIDs = []

  // delete previous message
  await ctx.deleteMessage()
})
