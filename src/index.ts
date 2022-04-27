// import * as functions from 'firebase-functions'
import { createBot } from './bot'
import { config } from './config'

const bot = createBot(config)

bot.launch().then(() => console.log('🚀 Bot started!'))

// export const botFunction = functions
//   .region(config.firebaseFunctionsRegion)
//   .https.onRequest((request, response) => {
//     bot.handleUpdate(request.body, response)
//   })
