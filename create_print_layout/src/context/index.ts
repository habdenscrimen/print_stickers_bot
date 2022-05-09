import admin from 'firebase-admin'
import { Database } from 'firebase-admin/database'
import { Logger } from 'winston'
import { Config } from '../config'

export interface Context {
  config: Config
  db: Database
  storage: admin.storage.Storage
  logger: Logger
}

interface newContextOptions {
  config: Config
  db: Database
  storage: admin.storage.Storage
  logger: Logger
}

export const newContext = (options: newContextOptions): Context => {
  return {
    config: options.config,
    storage: options.storage,
    db: options.db,
    logger: options.logger,
  }
}
