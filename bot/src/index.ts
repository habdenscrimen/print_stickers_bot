import 'dotenv/config'
import { Bot, webhookCallback, lazySession } from 'grammy'
import * as functions from 'firebase-functions'
import { initFirebase } from './firebase'
import { newConfig } from './config'
import { newDatabase, newStorageAdapter } from './database'
import { newLogger } from './logger'
import { CustomContext, SessionData } from './context'
import { Routes } from './routes'
import { newTelegramStickersServices } from './services/telegram_stickers'
import { Services } from './services'
import { deliveryComposer, mainMenuComposer, selectStickersComposer } from './composers'

const initBot = () => {
  // init logger, config, database, storage adapter
  const logger = newLogger()
  const config = newConfig()
  const { firebaseApp } = initFirebase(config)
  const database = newDatabase(firebaseApp)
  const storageAdapter = newStorageAdapter<SessionData>(firebaseApp, config)

  // init services
  const telegramStickersService = newTelegramStickersServices()

  const services: Services = {
    TelegramStickers: telegramStickersService,
  }

  // init bot
  const bot = new Bot<CustomContext>(process.env.TOKEN!, {
    client: {
      canUseWebhookReply: (method) => method !== 'getStickerSet',
    },
  })

  // configure session
  bot.use(
    lazySession({
      storage: storageAdapter,
      initial: (): SessionData => ({
        route: Routes.MainMenu,
        stickers: {},
        stickerSetName: '',
      }),
    }),
  )

  // TODO: add data once, not on every update
  // add data to context
  bot.use((ctx, next) => {
    ctx.database = database
    ctx.config = config
    ctx.logger = logger
    ctx.services = services

    // TODO: get user object and save it to ctx

    return next()
  })

  // use composers
  bot.use(mainMenuComposer)
  bot.use(selectStickersComposer)
  bot.use(deliveryComposer)

  bot.catch(console.error)
  return bot
}

const bot = initBot()

export const botFunction = functions
  .region(process.env.FIREBASE_FUNCTIONS_REGION!)
  .https.onRequest(webhookCallback(bot))
