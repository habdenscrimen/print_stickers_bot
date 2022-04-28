import dayjs from 'dayjs'
import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { saveFileToStorage } from '../firebase_storage'
import { scenes } from './scenes'

export const deliveryScene = new Scenes.BaseScene<CustomContext>(scenes.DELIVERY)

// enter the scene
deliveryScene.enter(async (ctx) => {
  console.debug('delivery scene: enter')

  // calculate price
  const price = ctx.session.stickerIDs.length * ctx.config.stickerCostUAH

  await ctx.reply(ctx.config.messages.scenes.delivery.enter(price), {
    reply_markup: {
      inline_keyboard: [
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

// listen for message with delivery address
deliveryScene.on('message', async (ctx) => {
  console.debug('delivery scene: got message')

  // get delivery address
  // @ts-expect-error
  const deliveryAddress = ctx.message.text as string

  // check if delivery address is valid
  if (deliveryAddress.trim().length === 0) {
    return
  }

  // save delivery address to session
  ctx.session.deliveryAddress = deliveryAddress

  // convert delivery address to buffer
  const deliveryAddressBuffer = Buffer.from(deliveryAddress, 'utf-8')

  // save delivery info to firebase storage
  const filePath = `${ctx.session.userID}/${dayjs(ctx.message.date * 1000).format(
    'DD-MM-YYYY',
  )}/delivery.txt`
  await saveFileToStorage(filePath, deliveryAddressBuffer)

  ctx.scene.enter(scenes.ORDER_CONFIRMED)
})
