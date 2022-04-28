import { Telegraf, Context, Scenes, session } from 'telegraf'
import { SceneSession, SceneSessionData } from 'telegraf/typings/scenes'
import { SessionContext } from 'telegraf/typings/session'
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
  session: {
    __scenes: SessionContext<SceneSession<SceneSessionData>>
    stickerIDs: string[]
    deliveryAddress: string
    contact: string
  }
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

  // enter `START` scene
  bot.start(async (ctx) => {
    ctx.session.contact = 'contact'

    await ctx.scene.enter(scenes.START)
  })

  // setup bot actions for navigating between scenes
  bot.action(scenes.START, (ctx) => ctx.scene.enter(scenes.START))
  bot.action(scenes.SELECT_STICKERS, (ctx) => ctx.scene.enter(scenes.SELECT_STICKERS))
  bot.action(scenes.CONFIRM_STICKERS, (ctx) => ctx.scene.enter(scenes.CONFIRM_STICKERS))
  bot.action(scenes.DELIVERY, (ctx) => ctx.scene.enter(scenes.DELIVERY))
  bot.action(scenes.ORDER_CONFIRMED, (ctx) => ctx.scene.enter(scenes.ORDER_CONFIRMED))
  bot.action(scenes.QUESTIONS, (ctx) => ctx.scene.enter(scenes.QUESTIONS))

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))

  return bot
}
