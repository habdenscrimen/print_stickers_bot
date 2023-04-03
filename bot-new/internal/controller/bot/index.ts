import { Api, Bot, lazySession, RawApi, StorageAdapter } from 'grammy'
import { Config } from 'config'
import { Logger } from 'pkg/logger'
import { Services } from 'internal/services'
import { hydrateReply, parseMode } from '@grammyjs/parse-mode'
import { Analytics } from 'pkg/analytics'
import {
  askDeliveryInfoComposer,
  askPhoneNumberComposer,
  commandsComposer,
  menusComposer,
  removeStickersFromOrderComposer,
  selectStickersComposer,
} from './composers'
import { SessionState, SessionSteps } from './session'
import { BotContext } from './context'
// import { commands } from './commands'

interface Options {
  config: Config
  logger: Logger
  storageAdapter: StorageAdapter<SessionState>
  services: Services
  analytics: Analytics
}

export const NewBot = async (options: Options): Promise<Bot<BotContext, Api<RawApi>>> => {
  // init bot
  const bot = new Bot<BotContext>(options.config.bot.token, {
    client: {
      canUseWebhookReply: (method) =>
        !new Set([
          'getStickerSet',
          'createNewStickerSet',
          'addStickerToSet',
          'deleteStickerFromSet',
          'sendMessage',
        ]).has(method),
    },
  })

  // configure session
  bot.use(
    lazySession({
      storage: options.storageAdapter,
      initial: (): SessionState => ({
        step: SessionSteps.MainMenu,
        order: {
          stickers: [],
          stickerSetName: undefined,
          deliveryInfo: undefined,
          promoCode: undefined,
        },
        user: undefined,
      }),
    }),
  )

  // Install format reply variant to ctx
  bot.use(hydrateReply)

  // Sets default parse_mode for ctx.reply
  bot.api.config.use(parseMode('MarkdownV2'))

  // update context data
  bot.use((ctx, next) => {
    ctx.logger = options.logger.child({ user: ctx.from?.id })
    ctx.config = options.config
    ctx.services = options.services
    ctx.analytics = options.analytics

    return next()
  })

  // // set commands for quick use in clients (like /start)
  // await bot.api.setMyCommands(commands)

  bot.use(menusComposer)
  bot.use(commandsComposer)
  bot.use(selectStickersComposer)
  bot.use(removeStickersFromOrderComposer)
  bot.use(askPhoneNumberComposer)
  bot.use(askDeliveryInfoComposer)

  return bot
}
