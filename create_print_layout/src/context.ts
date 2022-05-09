import { Logger } from 'winston'
import { Database } from './database'
import { Storage } from './storage'
import { Config } from './config'

export interface Context {
  config: Config
  db: Database
  storage: Storage
  logger: Logger
}

interface newContextOptions {
  config: Config
  database: Database
  storage: Storage
  logger: Logger
}

export const newContext = (options: newContextOptions): Context => {
  return {
    config: options.config,
    storage: options.storage,
    db: options.database,
    logger: options.logger,
  }
}
