import { Api, Bot, RawApi } from 'grammy'
import { initFirebase, newStorageAdapter } from '../../pkg/firebase'
import { Config } from '../../config'
import { Logger, newLogger } from '../logger'
import { Repos } from '../repos'
import { Services } from '../services'
import { newUsersRepo } from '../repos/users'
import { newOrdersRepo } from '../repos/orders'
import { newOrdersService } from '../services/orders'
import { newTelegramService } from '../services/telegram'
import { newPaymentService } from '../services/payment'
import { APIs } from '../api/api'
import { newLiqpayAPI } from '../api/psp/liqpay'
import { BotContext, BotSessionData } from '../controller/bot/context'
import { newBot } from '../controller/bot/bot'

interface App {
  repos: Repos
  services: Services
  tgApi: Api
  bot: Bot<BotContext, Api<RawApi>>
  logger: Logger
}

export const newApp = (config: Config): App => {
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

  // init telegram api
  const tgApi = new Api(config.bot.token)

  // init services
  const telegramService = newTelegramService({ apis, config, logger, repos, tgApi })
  const paymentService = newPaymentService({ apis, repos, config, logger })
  const ordersService = newOrdersService({
    apis,
    config,
    logger,
    repos,
    paymentService,
    telegramService,
  })

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

  return {
    bot,
    repos,
    services,
    tgApi,
    logger,
  }
}
