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
import { mainMenu } from './menus/main'

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
      getSessionKey: (ctx) => ctx.from?.id.toString(), // needs for handling payments
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
  bot.use(menus.selectPaymentMethod)
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

  // handle pre-checkout query
  bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true))

  // handle successful payment
  bot.on(':successful_payment', async (ctx) => {
    let logger = ctx.logger.child({ name: 'successful_payment', user_id: ctx.from!.id })

    try {
      // get order id from webhook payload
      const orderID = ctx.update.message?.successful_payment?.invoice_payload
      if (!orderID) {
        logger = logger.child({ ctx })
        logger.error('no order id in webhook payload')
        return
      }

      // update order status in database
      await ctx.repos.Orders.UpdateOrder(orderID, {
        paid: true,
        status: 'confirmed',
      })

      // clear order info from session
      const session = await ctx.session
      session.order = {}
      logger.debug('cleared order info from session')

      // change route to main menu
      session.route = Routes.Welcome

      // show success message to user
      await ctx.reply(`✅ Оплата пройшла успішно, замовлення оформлене!`, {
        reply_markup: mainMenu,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
    } catch (error) {
      logger.error(`failed to handle successful payment: ${error}`)
    }
  })

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
