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
import { Order, User } from '../../domain'
import { Logger } from '../../logger'
import { Repos } from '../../repos'
import { Services } from '../../services'
import { deleteMessagesTransformer } from './transformers'
import { Menus } from './menus'
import { router, Routes } from './routes'
import { commands } from './commands'
import { successfulPaymentText, Texts } from './texts'
import { newMainMenuTexts } from './texts/main_menu'
import { newMainMenu } from './menus/main'
import { newSelectStickersMenus } from './menus/select_stickers'
import { newSharedTexts } from './texts/shared'
import { newSelectStickersTexts } from './texts/select_stickers'
import { newDeliveryTexts } from './texts/delivery'
import { newPaymentMenus } from './menus/payment'
import { newPaymentTexts } from './texts/payment'
import { newFAQTexts } from './texts/faq'

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

interface SessionUser extends User {
  activeOrders?: Order[] | undefined
}

export interface BotSessionData {
  route: Routes
  user: SessionUser | undefined
  order: Partial<SessionOrder>
  orderToDelete: Partial<Order> | undefined
  invitedByUserName: string | undefined
}

export interface BotContext extends Context, LazySessionFlavor<BotSessionData> {
  logger: Logger
  config: Config
  services: Services
  repos: Repos
  texts: Texts
  menus: Menus

  // add custom fields to `reply` options
  reply: (
    text: string,
    other?: Parameters<Context['reply']>['1'] & {
      deleteInFuture?: boolean
      deletePrevBotMessages?: boolean
    },
    signal?: AbortSignal,
  ) => Promise<Message.TextMessage>
  editMessageText: (
    text: Parameters<Context['editMessageText']>['0'],
    other?: Parameters<Context['editMessageText']>['1'] & {
      deleteInFuture?: boolean
      deletePrevBotMessages?: boolean
    },
    signal?: AbortSignal,
  ) => ReturnType<Context['editMessageText']>
}

const disallowedWebhookReplyMethods = new Set(['getStickerSet', 'sendMessage'])

export const newBot = (options: BotOptions) => {
  const { config } = options

  // init bot
  const bot = new Bot<BotContext>(config.bot.token, {
    client: {
      canUseWebhookReply: (method) => !disallowedWebhookReplyMethods.has(method),
    },
  })

  // configure session
  bot.use(
    lazySession({
      getSessionKey: (ctx) => ctx.from?.id.toString(), // needs for handling payments
      storage: options.storageAdapter,
      initial: (): BotSessionData => ({
        route: Routes.Idle,
        user: undefined,
        order: {},
        orderToDelete: {},
        invitedByUserName: undefined,
      }),
    }),
  )

  // init texts
  const texts: Texts = {
    MainMenu: newMainMenuTexts({ config }),
    Shared: newSharedTexts({ config }),
    SelectStickers: newSelectStickersTexts({ config }),
    Delivery: newDeliveryTexts({ config }),
    Payment: newPaymentTexts({ config }),
    FAQ: newFAQTexts({ config }),
  }

  // init menus
  const menus: Menus = {
    Main: newMainMenu({ config }),
    SelectStickers: newSelectStickersMenus({ config }),
    Payment: newPaymentMenus({ config }),
  }

  // add data to context
  bot.use(async (ctx, next) => {
    ctx.repos = options.repos
    ctx.config = options.config
    ctx.logger = options.logger
    ctx.services = options.services
    ctx.texts = texts
    ctx.menus = menus

    if (config.bot.disabled) {
      await ctx.reply(
        `Перепрошую, наразі виконуються технічні роботи, тому бот тимчасово недоступний. Спробуйте трохи пізніше.`,
      )
      return next()
    }

    return next()
  })

  // use menus
  bot.use(menus.Main.Main)
  bot.use(menus.Main.GoBackToMainMenu)
  bot.use(menus.Payment.ChooseNovaPoshtaMethod)
  bot.use(menus.Payment.SelectPaymentMethod)
  bot.use(menus.SelectStickers.ConfirmStickerSet)
  bot.use(menus.SelectStickers.FinishSelectingStickers)
  bot.use(menus.SelectStickers.Done)

  // use transformers
  bot.api.config.use(deleteMessagesTransformer(bot.api))

  // if bot is disabled, don't handle any message
  if (config.bot.disabled) {
    return bot
  }

  // use commands
  bot.command(
    'start',
    config.features.referralProgram ? commands.start : commands.startWithoutReferral,
  )

  // use routes
  bot.use(router)

  // check if LiqPay feature is enabled
  if (config.features.liqPay) {
    // handle pre-checkout query
    bot.on('pre_checkout_query', (ctx) => {
      console.log('pre_checkout_query', JSON.stringify(ctx))

      return ctx.answerPreCheckoutQuery(true)
    })

    // handle successful payment
    bot.on(':successful_payment', async (ctx) => {
      const logger = ctx.logger.child({ name: 'successful_payment', user_id: ctx.from!.id })

      try {
        // clear order info from session
        const session = await ctx.session
        session.order = {}
        logger.debug('cleared order info from session')

        // change route to main menu
        session.route = Routes.Welcome

        // create message about successful payment
        const { text, parseMode } = successfulPaymentText(session.invitedByUserName)

        // show success message to user
        await ctx.reply(text, {
          reply_markup: menus.Main.Main,
          parse_mode: parseMode,
          deleteInFuture: true,
        })
      } catch (error) {
        logger.error(`failed to handle successful payment: ${error}`)
      }
    })
  }

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
