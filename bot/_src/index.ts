// import * as functions from 'firebase-functions'
import { createBot } from './bot'
import { config } from './config'
import { initFirebaseAdmin } from './firebase_storage'

// initialize firebase app
const { db } = initFirebaseAdmin()

// create telegram bot
const bot = createBot(config, db)

// launch telegram bot
bot.launch().then(() => console.log('🚀 Bot started!'))

// run `botFunction` firebase function that
// export const botFunction = functions
//   .region(config.firebase.functionsRegion)
// .https.onRequest((request, response) => {
//   bot.handleUpdate(request.body, response)
// })
