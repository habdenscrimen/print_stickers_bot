import { Logger } from 'winston'
import { Context, LazySessionFlavor } from 'grammy'
import { Database } from './database'
// import { Storage } from './storage'
import { Config } from './config'
import { Routes } from './routes'
import { Services } from './services'

type StickerID = string
type StickerFileID = string

export interface SessionData {
  route: Routes
  stickers: Record<StickerID, StickerFileID> | undefined
  stickerSetName: string | undefined
  stickerSets: string[] | undefined
}

interface CustomContextOptions {
  database: Database
  logger: Logger
  config: Config
  services: Services
}

export type CustomContext = Context &
  LazySessionFlavor<SessionData> &
  CustomContextOptions
