import { initFirebase, newStorageAdapter } from '../../pkg/firebase'
import { Config } from '../../config'
import { BotSessionData, newBot } from '../controller/bot'
import { newLogger } from '../logger'
import { Repos } from '../repos'
import { Services } from '../services'

export const newApp = (config: Config) => {
  // init logger
  const logger = newLogger()

  // init firebase
  initFirebase(config)

  // init storage adapter
  const storageAdapter = newStorageAdapter<BotSessionData>(config)

  // init repos
  const repos: Repos = {}

  // init services
  const services: Services = {}

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
