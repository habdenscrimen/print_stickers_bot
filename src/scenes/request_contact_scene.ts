import { ReplyKeyboardMarkup } from 'typegram'
import { Scenes } from 'telegraf'
import { CustomContext } from '../bot'
import { scenes } from './scenes'
import { saveUserContact } from '../firebase_database'

export const requestContactScene = new Scenes.BaseScene<CustomContext>(
  scenes.REQUEST_CONTACT,
)

// enter the scene
requestContactScene.enter(async (ctx) => {
  console.debug('request contact scene: enter')

  const hasUsername = ctx.callbackQuery?.from.username

  // create enter message depending on whether user has username
  const enterMessage = hasUsername
    ? ctx.config.messages.scenes.requestContact.enterWithUsername
    : ctx.config.messages.scenes.requestContact.enterWithoutUsername

  // setup keyboard
  const keyboard: ReplyKeyboardMarkup['keyboard'] = [
    [
      {
        text: ctx.config.messages.scenes.requestContact.requestContactButton,
        request_contact: true,
      },
    ],
  ]

  // if user has username, add ability to skip contact request
  if (hasUsername) {
    keyboard[0].push({
      text: ctx.config.messages.scenes.requestContact.skipContactButton,
    })
  }

  // show enter message with keyboard
  await ctx.reply(enterMessage, {
    reply_markup: {
      keyboard,
      one_time_keyboard: true,
    },
  })
})

// listen for skipping contact request
requestContactScene.on('text', async (ctx) => {
  try {
    console.debug('request contact scene: text')

    // check if user clicked "Skip contact request" button
    if (
      ctx.message.text !== ctx.config.messages.scenes.requestContact.skipContactButton
    ) {
      console.debug('request contact scene: user does not click on skip button')
      return
    }

    // save user id to session
    ctx.session.userID = ctx.message.from.id

    // save user username to firebase database
    await saveUserContact(ctx.database, ctx.message.from.id, {
      username: ctx.message.from.username!,
    })

    // go to next scene
    await ctx.scene.enter(scenes.SELECT_STICKERS)
  } catch (error) {
    console.error(`failed to save user username to database: ${error}`)
  }
})

requestContactScene.on('contact', async (ctx) => {
  try {
    console.debug('request contact scene: contact')

    // update user id in session
    ctx.session.userID = ctx.message.contact.user_id!

    const { phone_number, first_name, last_name, user_id } = ctx.message.contact

    // save user contact to database
    await saveUserContact(ctx.database, user_id!, {
      username: ctx.message.from.username!,
      phone_number,
      first_name,
      last_name,
    })

    // go to next scene
    await ctx.scene.enter(scenes.SELECT_STICKERS)
  } catch (error) {
    console.error(`failed to save contact to database: ${error}`)
  }
})

// leave the scene
requestContactScene.leave(async (ctx) => {
  console.debug('request contact scene: leave')

  // delete previous message
  await ctx.deleteMessage()
})
