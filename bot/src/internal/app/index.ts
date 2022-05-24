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
import { newPaymentService } from '../services/payment'
import { APIs } from '../api/api'
import { newLiqpayAPI } from '../api/psp/liqpay'

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

  // init apis
  const apis: APIs = {
    PSP: newLiqpayAPI({ config, logger }),
  }

  // init services
  const telegramService = newTelegramService()
  const paymentService = newPaymentService({ apis, repos, config, logger })
  const ordersService = newOrdersService({ apis, config, logger, paymentService, repos })

  const services: Services = {
    Orders: ordersService,
    Telegram: telegramService,
    Payment: paymentService,
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
