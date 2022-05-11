import { Logger } from 'winston'
import { Context, LazySessionFlavor } from 'grammy'
import { Database } from './database'
// import { Storage } from './storage'
import { Config } from './config'
import { Routes } from './routes'

export interface SessionData {
  route: Routes
}

interface CustomContextOptions {
  database: Database
  logger: Logger
  config: Config
}

export type CustomContext = Context &
  LazySessionFlavor<SessionData> &
  CustomContextOptions
