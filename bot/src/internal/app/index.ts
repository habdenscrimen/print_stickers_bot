import { initFirebase, newStorageAdapter } from '../../pkg/firebase'
import { Config } from '../../config'
import { BotSessionData, newBot } from '../controller/bot'
import { newLogger } from '../logger'
import { Repos } from '../repos'
import { Services } from '../services'
import { newUsersRepo } from '../repos/users'
import { newOrdersRepo } from '../repos/orders'
import { newOrdersService } from '../services/orders'
import { newTelegramService } from '../services/telegram'

export const newApp = (config: Config) => {
  // init logger
  const logger = newLogger(config)

  // init firebase
  const { firestore } = initFirebase(config)

  // init storage adapter
  const storageAdapter = newStorageAdapter<BotSessionData>(config, firestore)

  // init repos
  const repos: Repos = {
    Users: newUsersRepo(firestore),
    Orders: newOrdersRepo(firestore),
  }

  // init services
  const ordersService = newOrdersService()
  const telegramService = newTelegramService()

  const services: Services = {
    Orders: ordersService,
    Telegram: telegramService,
  }

  // init bot
  const bot = newBot({
    config,
    storageAdapter,
    logger,
    repos,
    services,
  })

  return { bot }
}
