import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { updateOrder } from '../firebase_database'
import { deleteStickerSet } from '../sticker_set'
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

  // delete temp sticker set
  await deleteStickerSet(ctx)

  // delete stickers data from session
  ctx.session.stickerSetName = ''
  ctx.session.stickerIDs = []
})

// leave the scene
orderConfirmedScene.leave(async (ctx) => {
  console.debug('order confirmed scene: leave')

  // delete previous message
  await ctx.deleteMessage()
})
