// import * as functions from 'firebase-functions'
import { createBot } from './bot'
import { config } from './config'
import { initFirebaseApp } from './firebase_storage'

// initialize firebase app
initFirebaseApp()

// create telegram bot
const bot = createBot(config)

// launch telegram bot
bot.launch().then(() => console.log('🚀 Bot started!'))

// run `botFunction` firebase function that
// export const botFunction = functions
//   .region(config.firebaseFunctionsRegion)
//   .https.onRequest((request, response) => {
//     bot.handleUpdate(request.body, response)
//   })
