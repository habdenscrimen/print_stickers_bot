import { Telegraf, Context } from 'telegraf'
import dayjs from 'dayjs'
import { createDirectoryIfNotExist, downloadFile } from './files'
import { Config } from './config'

const token = `5368390662:AAF8FgsLBYQFW53CB25Weoh5ZOuUI-DyTc0`

export interface CustomContext extends Context {
  config: Config
}

export const createBot = (config: Config) => {
  const bot = new Telegraf<CustomContext>(token)
  bot.context.config = config

  bot.start((ctx) => ctx.reply(`Welcome!`))

  bot.on('sticker', async (ctx) => {
    try {
      // TODO: refactor this
      // create user directory
      const { id, username, first_name, last_name } = ctx.message.from

      const userDirectory = `${ctx.config.filesDirectory}/${
        username || `${first_name} ${last_name}`
      }_${id}_${dayjs(ctx.message.date * 1000).format('DD-MM-YYYY')}`

      createDirectoryIfNotExist(userDirectory)

      // get file link for downloading
      const fileDownloadURL = await ctx.telegram.getFileLink(ctx.message.sticker.file_id)

      // download file by url
      await downloadFile(fileDownloadURL.href, ctx.message.sticker.file_id, userDirectory)

      ctx.reply(`👍`)
    } catch (error) {
      console.error(`Failed to handle sticker message: ${error}`)
    }
  })

  return bot
}
