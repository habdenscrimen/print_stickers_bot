import { Telegraf, Context, Scenes, session } from 'telegraf'
import { Config } from './config'
import {
  scenes,
  startScene,
  selectStickersScene,
  confirmStickersScene,
  questionsScene,
  deliveryScene,
  orderConfirmedScene,
} from './scenes'

export interface CustomContext extends Context {
  config: Config
  scene: Scenes.SceneContextScene<CustomContext>
}

/** createBot creates a new bot */
export const createBot = (config: Config) => {
  // create a bot
  const bot = new Telegraf<CustomContext>(config.token)

  // create a stage
  const stage = new Scenes.Stage<CustomContext>([
    startScene,
    selectStickersScene,
    confirmStickersScene,
    questionsScene,
    deliveryScene,
    orderConfirmedScene,
  ])

  // add config to context
  bot.use((ctx, next) => {
    ctx.config = config
    return next()
  })

  // TODO: remove deprecated `session`
  // add stage with scenes to bot
  bot.use(session())
  bot.use(stage.middleware())

  bot.start(async (ctx) => {
    await ctx.scene.enter(scenes.START)
  })

  // setup bot actions for navigating between scenes
  bot.action(scenes.START, (ctx) => ctx.scene.enter(scenes.START))
  bot.action(scenes.SELECT_STICKERS, (ctx) => ctx.scene.enter(scenes.SELECT_STICKERS))
  bot.action(scenes.CONFIRM_STICKERS, (ctx) => ctx.scene.enter(scenes.CONFIRM_STICKERS))
  bot.action(scenes.QUESTIONS, (ctx) => ctx.scene.enter(scenes.QUESTIONS))
  bot.action(scenes.DELIVERY, (ctx) => ctx.scene.enter(scenes.DELIVERY))
  bot.action(scenes.ORDER_CONFIRMED, (ctx) => ctx.scene.enter(scenes.ORDER_CONFIRMED))

  // bot.on('sticker', async (ctx) => {
  //   try {
  //     // TODO: refactor this
  //     // create user directory
  //     const { id, username, first_name, last_name } = ctx.message.from

  //     const userDirectory = `${ctx.config.filesDirectory}/${
  //       username || `${first_name} ${last_name}`
  //     }_${id}_${dayjs(ctx.message.date * 1000).format('DD-MM-YYYY')}`

  //     createDirectoryIfNotExist(userDirectory)

  //     // get file link for downloading
  //     const fileDownloadURL = await ctx.telegram.getFileLink(ctx.message.sticker.file_id)

  //     // download file by url
  //     await downloadFile(fileDownloadURL.href, ctx.message.sticker.file_id, userDirectory)

  //     ctx.reply(`👍`)
  //   } catch (error) {
  //     console.error(`Failed to handle sticker message: ${error}`)
  //   }
  // })

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))

  return bot
}
