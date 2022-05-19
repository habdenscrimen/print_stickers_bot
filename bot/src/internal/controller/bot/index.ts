import { Bot, lazySession, Context, LazySessionFlavor, StorageAdapter } from 'grammy'
import { Message } from 'grammy/out/platform.node'
import { Config } from '../../../config'
import { User } from '../../domain'
import { Logger } from '../../logger'
import { Repos } from '../../repos'
import { Services } from '../../services'

interface BotOptions {
  config: Config
  services: Services
  repos: Repos
  logger: Logger
  storageAdapter: StorageAdapter<BotSessionData>
}

interface BotOptions {}

export interface BotSessionData {
  route: Routes
  stickers: Record<string, string> | undefined
  stickerSetName: string | undefined
  stickerSets: string[] | undefined
  invitedByTelegramUserID: number | undefined
  user: User | undefined
}

interface CustomContextFlavor extends Context {
  reply: (
    text: string,
    other?: Parameters<Context['reply']>['1'] & {
      deleteInFuture?: boolean
      deletePrevBotMessages?: boolean
    },
    signal?: AbortSignal,
  ) => Promise<Message.TextMessage>
}

interface BotContext extends CustomContextFlavor, LazySessionFlavor<BotSessionData> {
  logger: Logger
  config: Config
  services: Services
  repos: Repos
}

// TODO: get rid of this
enum Routes {
  Idle = 'idle',
  MainMenu = 'main_menu',
  RequestContact = 'request_contact',
  SelectStickers = 'select_stickers',
  ConfirmStickers = 'confirm_stickers',
  Delivery = 'delivery',
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
        route: Routes.MainMenu,
        stickers: undefined,
        stickerSetName: undefined,
        stickerSets: undefined,
        invitedByTelegramUserID: undefined,
        user: undefined,
      }),
    }),
  )

  bot.on('message', (ctx) => ctx.reply('Hello!'))

  return bot
}
