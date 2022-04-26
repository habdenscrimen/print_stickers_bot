import { createBot } from './bot'
import { createDirectoryIfNotExist } from './files'
import { config } from './config'

const bot = createBot(config)
createDirectoryIfNotExist(config.filesDirectory)

bot.launch().then(() => console.log('🚀 Bot started!'))
