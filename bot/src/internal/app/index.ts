import { Api, Bot, RawApi } from 'grammy'
import { initFirebase, newStorageAdapter } from '../../pkg/firebase'
import { Config } from '../../config'
import { BotContext, BotSessionData, newBot } from '../controller/bot'
import { Logger, newLogger } from '../logger'
import { Repos } from '../repos'
import { Services } from '../services'
import { newUsersRepo } from '../repos/users'
import { newOrdersRepo } from '../repos/orders'
import { newOrdersService } from '../services/orders'
import { newTelegramService } from '../services/telegram'
import { newPaymentService } from '../services/payment'
import { APIs, PSPApi } from '../api/api'
import { newLiqpayAPI } from '../api/psp/liqpay'
import { newNotificationService } from '../services/notification'
import { newUserService } from '../services/user'
import { newQuestionsRepo } from '../repos/questions'
import { newQuestionService } from '../services/question'

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
  const { firestore, functions } = initFirebase(config)

  // init storage adapter
  const storageAdapter = newStorageAdapter<BotSessionData>(config, firestore)

  // init repos
  const repos: Repos = {
    Users: newUsersRepo(firestore),
    Orders: newOrdersRepo(firestore),
    Questions: newQuestionsRepo(firestore),
  }

  // init apis
  // @ts-expect-error
  const liqpayAPI: PSPApi = config.features.liqPay ? newLiqpayAPI({ config, logger }) : {}

  const apis: APIs = {
    PSP: liqpayAPI,
  }

  // init telegram api
  const tgApi = new Api(config.bot.token)

  // init services
  const telegramService = newTelegramService({ apis, config, logger, repos, tgApi })
  const notificationService = newNotificationService({
    apis,
    config,
    logger,
    repos,
    telegramService,
    functions,
  })
  const userService = newUserService({ apis, config, logger, repos })
  const paymentService = newPaymentService({
    apis,
    repos,
    config,
    logger,
    notificationService,
    userService,
  })
  const ordersService = newOrdersService({
    apis,
    config,
    logger,
    repos,
    paymentService,
    telegramService,
    notificationService,
  })
  const questionService = newQuestionService({
    apis,
    config,
    logger,
    repos,
    notificationService,
  })

  const services: Services = {
    Orders: ordersService,
    Telegram: telegramService,
    Payment: paymentService,
    Notification: notificationService,
    User: userService,
    Question: questionService,
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
