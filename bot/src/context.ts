import { Logger } from 'winston'
import { Context, LazySessionFlavor } from 'grammy'
import { Database } from './database'
// import { Storage } from './storage'
import { Config } from './config'
import { Routes } from './routes'
import { Services } from './services'
import { User } from './domain'

type StickerID = string
type StickerFileID = string

export interface SessionData {
  route: Routes
  stickers: Record<StickerID, StickerFileID> | undefined
}

interface CustomContextOptions {
  database: Database
  logger: Logger
  config: Config
  services: Services
  user: User | undefined
}

export type CustomContext = Context &
  LazySessionFlavor<SessionData> &
  CustomContextOptions
