import { Config } from 'config'
import { Context, LazySessionFlavor } from 'grammy'
import type { ParseModeContext } from '@grammyjs/parse-mode'
import { Services } from 'internal/services'
import { Logger } from 'pkg/logger'
import { SessionState } from './session'

export interface BotContext extends Context, LazySessionFlavor<SessionState>, ParseModeContext {
  config: Config
  logger: Logger
  services: Services
}
