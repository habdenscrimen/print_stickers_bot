import {
  Bot,
  lazySession,
  Context,
  LazySessionFlavor,
  StorageAdapter,
  GrammyError,
  HttpError,
} from 'grammy'
import { Message } from 'grammy/out/platform.node'
import { Config } from '../../../config'
import { User } from '../../domain'
import { Logger } from '../../logger'
import { Repos } from '../../repos'
import { Services } from '../../services'
import { deleteMessagesTransformer } from './transformers'
import { menus } from './menus'
import { router, Routes } from './routes'
import { commands } from './commands'

interface BotOptions {
  config: Config
  services: Services
  repos: Repos
  logger: Logger
  storageAdapter: StorageAdapter<BotSessionData>
}

interface SessionOrder {
  stickerSetName: string | undefined
  stickers: Record<string, string> | undefined
  invitedByTelegramUserID: number | undefined
  deliveryInfo: string | undefined
}

export interface BotSessionData {
  route: Routes
  user: User | undefined
  order: Partial<SessionOrder>
}

export interface BotContext extends Context, LazySessionFlavor<BotSessionData> {
  logger: Logger
  config: Config
  services: Services
  repos: Repos

  // add custom fields to `reply` options
  reply: (
    text: string,
    other?: Parameters<Context['reply']>['1'] & {
      deleteInFuture?: boolean
      deletePrevBotMessages?: boolean
    },
    signal?: AbortSignal,
  ) => Promise<Message.TextMessage>
}

const disallowedWebhookReplyMethods = new Set(['getStickerSet', 'sendMessage'])

export const newBot = (options: BotOptions) => {
  // init bot
  const bot = new Bot<BotContext>(options.config.bot.token, {
    client: {
      canUseWebhookReply: (method) => !disallowedWebhookReplyMethods.has(method),
    },
  })

  // configure session
  bot.use(
    lazySession({
      storage: options.storageAdapter,
      initial: (): BotSessionData => ({
        route: Routes.Idle,
        user: undefined,
        order: {},
      }),
    }),
  )

  // add data to context
  bot.use((ctx, next) => {
    ctx.repos = options.repos
    ctx.config = options.config
    ctx.logger = options.logger
    ctx.services = options.services

    return next()
  })

  // use menus
  bot.use(menus.mainMenu)
  bot.use(menus.confirmStickerSet)
  bot.use(menus.confirmSelectStickersDoneMenu)
  bot.use(menus.selectStickersDoneMenu)

  // use transformers
  bot.api.config.use(deleteMessagesTransformer(bot.api))

  // use commands
  bot.command('start', commands.start)

  // use routes
  bot.use(router)

  // handle unhandled errors
  bot.catch((err) => {
    const { ctx } = err
    console.error(`Error while handling update ${ctx.update.update_id}:`)

    const e = err.error

    if (e instanceof GrammyError) {
      console.error('Error in request:', e.description)
    } else if (e instanceof HttpError) {
      console.error('Could not contact Telegram:', e)
    } else {
      console.error('Unknown error:', e)
    }
  })

  return bot
}
