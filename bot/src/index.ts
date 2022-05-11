import 'dotenv/config'
import { Bot, webhookCallback, lazySession } from 'grammy'
import * as functions from 'firebase-functions'
import { requestContactRouter, mainMenuRouter } from './routers'
import { composer } from './composers'
import { mainMenu } from './menus'
import { initFirebase } from './firebase'
import { newConfig } from './config'
import { newDatabase, newStorageAdapter } from './database'
import { newLogger } from './logger'
import { CustomContext, SessionData } from './context'
import { Routes } from './routes'

const initBot = () => {
  // init services
  const logger = newLogger()
  const config = newConfig()
  const { firebaseApp } = initFirebase(config)
  const database = newDatabase(firebaseApp)
  const storageAdapter = newStorageAdapter<SessionData>(firebaseApp, config)

  // init bot
  const bot = new Bot<CustomContext>(process.env.TOKEN!)

  // configure session
  bot.use(
    lazySession({
      storage: storageAdapter,
      initial: (): SessionData => ({
        route: Routes.MainMenu,
      }),
    }),
  )

  // add data to context
  bot.use((ctx, next) => {
    ctx.database = database
    ctx.config = config
    ctx.logger = logger

    return next()
  })

  // use menus
  bot.use(mainMenu)

  // use routers
  bot.use(requestContactRouter)
  bot.use(mainMenuRouter)

  // use composers
  bot.use(composer)

  bot.catch(console.error)
  return bot
}

const bot = initBot()

export const botFunction = functions
  .region(process.env.FIREBASE_FUNCTIONS_REGION!)
  .https.onRequest(webhookCallback(bot))
