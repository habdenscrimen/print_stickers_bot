import 'dotenv/config'
import { Bot, webhookCallback, lazySession } from 'grammy'
import * as functions from 'firebase-functions'
import { initFirebase } from './firebase'
import { newConfig } from './config'
import { newDatabase, newStorageAdapter } from './database'
import { newLogger } from './logger'
import { CustomContext, SessionData } from './context'
import { Routes } from './routes'
import { newTelegramServices } from './services/telegram'
import { Services } from './services'
import { deliveryComposer, mainMenuComposer, selectStickersComposer } from './composers'
import { deleteMessagesTransformer } from './transformers'
import { newOrdersServices } from './services/orders'
import { newUserServices } from './services/users'
import { newNotificationsServices } from './services/notifications'

const initBot = () => {
  // init logger, config, database, storage adapter
  const logger = newLogger()
  const config = newConfig()
  initFirebase(config)
  const database = newDatabase()
  const storageAdapter = newStorageAdapter<SessionData>(config)

  // init services
  const telegramStickersService = newTelegramServices()
  const ordersServices = newOrdersServices()
  const userServices = newUserServices()
  const notificationServices = newNotificationsServices()

  const services: Services = {
    Telegram: telegramStickersService,
    Orders: ordersServices,
    User: userServices,
    Notifications: notificationServices,
  }

  // init bot
  const bot = new Bot<CustomContext>(process.env.TOKEN!, {
    client: {
      canUseWebhookReply: (method) =>
        method !== 'getStickerSet' && method !== 'sendMessage',
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
        stickerSets: [],
        invitedByTelegramUserID: undefined,
        user: undefined,
      }),
    }),
  )

  // use transformers
  bot.api.config.use(deleteMessagesTransformer(bot.api))

  // TODO: add data once, not on every update
  // add data to context
  bot.use((ctx, next) => {
    ctx.database = database
    ctx.config = config
    ctx.logger = logger
    ctx.services = services

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
