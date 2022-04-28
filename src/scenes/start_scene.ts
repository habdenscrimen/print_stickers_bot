import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { scenes } from './scenes'

export const startScene = new Scenes.BaseScene<CustomContext>(scenes.START)

// enter the scene
startScene.enter(async (ctx) => {
  try {
    console.debug('start scene: enter')

    // check if contact exists in database
    const snapshot = await ctx.database.ref(`users/${ctx.from!.id}`).get()
    const contactExists = snapshot.exists()

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
