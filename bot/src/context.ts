import { Logger } from 'winston'
import { Context, LazySessionFlavor } from 'grammy'
import { Message } from 'grammy/out/platform.node'
import { AbortSignal } from 'grammy/out/shim.node'
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
  stickerSetName: string | undefined
  stickerSets: string[] | undefined
  invitedByTelegramUserID: number | undefined
  user: User | undefined
}

interface CustomContextOptions {
  database: Database
  logger: Logger
  config: Config
  services: Services
}

type OtherWithDeletingOptions = Parameters<Context['reply']>['1'] & {
  deleteInFuture?: boolean
  deletePrevBotMessages?: boolean
}

interface CustomContextFlavor extends Context {
  reply: (
    text: string,
    other?: OtherWithDeletingOptions,
    signal?: AbortSignal,
  ) => Promise<Message.TextMessage>
}

export type CustomContext = CustomContextFlavor &
  LazySessionFlavor<SessionData> &
  CustomContextOptions
