import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { checkIfUserContactExists, updateOrder, getOrder } from '../firebase_database'
import { deleteFileFromStorage } from '../firebase_storage'
import { scenes } from './scenes'

export const startScene = new Scenes.BaseScene<CustomContext>(scenes.START)

// enter the scene
startScene.enter(async (ctx) => {
  try {
    console.debug('start scene: enter')

    // check if there's order id in session
    if (ctx.session.databaseOrderID) {
      // get order from database
      const order = await getOrder(ctx.database, ctx.session.databaseOrderID)

      // check if order is not confirmed
      if (order?.status === 'unconfirmed') {
        // delete order files from storage
        await deleteFileFromStorage(ctx.session.databaseOrderID)

        // delete order from database
        await updateOrder(ctx.database, ctx.session.databaseOrderID, {
          status: 'cancelled',
        })
      }

      // clear order id from session
      ctx.session.databaseOrderID = ''
    }

    // clear session data
    ctx.session.stickerIDs = []
    ctx.session.deliveryAddress = ''

    // check if contact exists in database
    const contactExists = await checkIfUserContactExists(ctx.database, ctx.from!.id)

    // if contact exists in database, save user id to session
    if (contactExists) {
      ctx.session.userID = ctx.from!.id
    }

    await ctx.reply(ctx.config.messages.scenes.start.enter, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Обрати стікери',
              // if contact already saved, select stickers (skip contact request)
              callback_data: contactExists
                ? scenes.SELECT_STICKERS
                : scenes.REQUEST_CONTACT,
            },
            { text: 'У мене є питання', callback_data: scenes.QUESTIONS },
          ],
        ],
      },
    })
  } catch (error) {
    console.error(`failed to enter start scene: ${error}`)
  }
})

// leave the scene
startScene.leave(async (ctx) => {
  console.debug('start scene: leave')

  // delete previous message
  await ctx.deleteMessage()
})
