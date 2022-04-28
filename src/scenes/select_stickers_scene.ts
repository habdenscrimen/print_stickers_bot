import { Message } from 'telegraf/typings/core/types/typegram'
import { Scenes, Telegram } from 'telegraf'
import { nanoid } from 'nanoid'
import download from 'download'
import dayjs from 'dayjs'

import { saveFileToStorage } from '../firebase_storage'
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

    // TODO(minor): delete previous message (bot's message with button)

    // validate sticker type - animated stickers are not supported
    if (ctx.message.sticker.is_animated || ctx.message.sticker.is_video) {
      await ctx.reply(ctx.config.messages.animatedStickersNotSupported)
      return
    }

    // add sticker id to session
    const newStickerID = ctx.message.sticker.file_unique_id
    const oldStickerIDs = ctx.session?.stickerIDs || []

    // if sticker already exists, don't add it again
    if (!oldStickerIDs.includes(newStickerID)) {
      ctx.session.stickerIDs = [...oldStickerIDs, newStickerID]

      // get sticker and save it to firebase storage
      getFileAndSaveToStorage(ctx.telegram, ctx.message, ctx.session.contact)
    }

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
    console.error(`failed to handle sticker message: ${error}`)
  }
})

/** getFileAndSaveToStorage downloads sticker as file from Telegram server and uploads it to Firebase Storage */
const getFileAndSaveToStorage = async (
  telegram: Telegram,
  message: Message.StickerMessage,
  contact: string,
) => {
  // get file link for downloading
  const fileDownloadURL = await telegram.getFileLink(message.sticker.file_id)

  // get file buffer
  const fileBuffer = await download(fileDownloadURL.href)

  // get data for saving file to firebase storage
  const filePath = `${contact}/${dayjs(message.date * 1000).format('DD-MM-YYYY')}`
  const randomFileName = nanoid(10)
  const fileExtension = fileDownloadURL.href.split('.').pop()

  // save sticker to firebase storage
  await saveFileToStorage(`${filePath}/${randomFileName}.${fileExtension}`, fileBuffer)

  console.debug('successfully saved sticker to firebase storage')
}

// leave the scene
selectStickersScene.leave(async (ctx) => {
  console.debug('select stickers scene: leave')

  // delete previous message
  await ctx.deleteMessage()
})
