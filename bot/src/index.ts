import 'dotenv/config'
import { Bot, webhookCallback, session } from 'grammy'
import * as functions from 'firebase-functions'
import { CustomContext, Routes, SessionData } from './types'
import { requestContactRouter, mainMenuRouter } from './routers'
import { composer } from './composers'
import { mainMenu } from './menus'
import { initFirebase } from './firebase'
import { newConfig } from './config'
import { newDatabase, newStorageAdapter } from './database'

const initBot = () => {
  // init services
  const config = newConfig()
  const { firebaseApp } = initFirebase(config)
  const database = newDatabase(firebaseApp)
  const storageAdapter = newStorageAdapter(firebaseApp, config)

  // init bot
  const bot = new Bot<CustomContext>(process.env.TOKEN!)

  bot.use(
    session({
      storage: storageAdapter,
      initial: (): SessionData => ({
        route: Routes.MainMenu,
      }),
    }),
  )

  // use menus
  bot.use(mainMenu)

  // use routers
  bot.use(requestContactRouter)
  bot.use(mainMenuRouter)

  // use composers
  bot.use(composer)

  return bot
}

const bot = initBot()

export const botFunction = functions
  .region(process.env.FIREBASE_FUNCTIONS_REGION!)
  .https.onRequest(webhookCallback(bot))
