import { Scenes, Telegram } from 'telegraf'
import { nanoid } from 'nanoid'
import download from 'download'

import { ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { saveFileToStorage } from '../firebase_storage'
import { CustomContext } from '../bot'
import { scenes } from './scenes'
import { createOrder } from '../firebase_database'

export const selectStickersScene = new Scenes.BaseScene<CustomContext>(
  scenes.SELECT_STICKERS,
)

// enter the scene
selectStickersScene.enter(async (ctx) => {
  console.debug('select stickers scene: enter')

  // show "Select stickers" message with "Go back" button
  await ctx.reply(ctx.config.messages.scenes.selectStickers.enter, {
    reply_markup: {
      inline_keyboard: [
        [{ text: ctx.config.messages.goBack, callback_data: scenes.START }],
      ],
    },
  })
})

// TODO: looks like shit, refactor it
// handle getting sticker
selectStickersScene.on('sticker', async (ctx) => {
  try {
    console.debug(`select stickers scene: got sticker`)

    // TODO(minor): delete previous message (bot's message with button)

    // validate sticker type - animated stickers are not supported
    if (ctx.message.sticker.is_animated || ctx.message.sticker.is_video) {
      const extra: ExtraReplyMessage = {}

      // check if there are valid stickers
      if (ctx.session.stickerIDs.length !== 0) {
        extra.reply_markup = {
          inline_keyboard: [
            [
              {
                text: ctx.config.messages.scenes.selectStickers.finish,
                callback_data: scenes.CONFIRM_STICKERS,
              },
            ],
          ],
        }
      }

      await ctx.reply(ctx.config.messages.animatedStickersNotSupported, extra)
      return
    }

    // add sticker id to session
    const newStickerID = ctx.message.sticker.file_unique_id
    const oldStickerIDs = ctx.session?.stickerIDs || []

    // check if sticker is already added
    if (oldStickerIDs.includes(newStickerID)) {
      ctx.reply(ctx.config.messages.scenes.selectStickers.duplicateSticker)
      return
    }

    // add sticker id to session
    ctx.session.stickerIDs = [...oldStickerIDs, newStickerID]

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

    // download sticker file
    const { fileBuffer, fileExtension } = await downloadStickerFile(
      ctx.telegram,
      ctx.message.sticker.file_id,
    )

    // create order if it doesn't exist
    if (!ctx.session.databaseOrderID) {
      const orderID = nanoid(10)
      ctx.session.databaseOrderID = orderID

      // create order
      await createOrder(ctx.database, orderID, ctx.session.userID)
    }

    // generate random file name
    const randomFileName = nanoid(10)

    // save sticker to firebase storage
    await saveFileToStorage(
      `${ctx.session.databaseOrderID}/${randomFileName}.${fileExtension}`,
      fileBuffer,
    )

    // if sticker set exists, add sticker to it
    if (ctx.session.stickerSetName) {
      // add sticker to sticker set
      await ctx.addStickerToSet(ctx.session.stickerSetName, {
        emojis: `😆`,
        png_sticker: ctx.message.sticker.file_id,
      })

      console.debug('successfully added sticker to temp sticker set')
      return
    }

    // if temp sticker set doesn't exist, create it
    const randomStickerSetID = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000

    // create sticker set name
    const stickerSetName = `print_stickers_${randomStickerSetID}_by_print_stickers_ua_bot`

    // create sticker set
    await ctx.createNewStickerSet(stickerSetName, ctx.config.tempStickerSetName, {
      emojis: `😆`,
      png_sticker: ctx.message.sticker.file_id,
    })
    ctx.session.stickerSetName = stickerSetName

    console.debug('successfully created new temp sticker set')
  } catch (error) {
    console.error(`failed to handle sticker message: ${error}`)
  }
})

/** downloadStickerFile downloads sticker file */
const downloadStickerFile = async (telegram: Telegram, stickerFileID: string) => {
  console.debug(`downloading sticker file: ${stickerFileID}`)

  // get file link for downloading
  const fileDownloadURL = await telegram.getFileLink(stickerFileID)

  // get file buffer
  const fileBuffer = await download(fileDownloadURL.href)

  console.debug('successfully download sticker file')
  return { fileBuffer, fileExtension: fileDownloadURL.href.split('.').pop() }
}

// leave the scene
selectStickersScene.leave(async (ctx) => {
  console.debug('select stickers scene: leave')

  // delete previous message
  await ctx.deleteMessage()
})
