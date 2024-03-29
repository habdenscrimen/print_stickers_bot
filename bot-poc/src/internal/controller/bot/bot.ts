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
import { BotContext, BotSessionData } from './context'
import { steps } from './steps'

// import { deleteMessagesTransformer } from './transformers'
// import { menus } from './menus'
// import { router, Routes } from './routes'
// import { commands } from './commands'
// import { mainMenu } from './menus/main'
// import { successfulPaymentText } from './texts'

interface BotOptions {
  config: Config
  services: Services
  repos: Repos
  logger: Logger
  storageAdapter: StorageAdapter<BotSessionData>
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
        route: 'main-menu',
        user: undefined,
        order: {},
        orderToDelete: {},
      }),
    }),
  )

  // add data to context
  bot.use((ctx, next) => {
    ctx.repos = options.repos
    ctx.config = options.config
    ctx.logger = options.logger
    ctx.services = options.services

    if (options.config.bot.disabled) {
      ctx.reply(
        `Перепрошую, наразі виконуються технічні роботи, тому бот тимчасово недоступний. Спробуйте трохи пізніше.`,
      )
      return next()
    }

    // console.log('CTX')
    // console.log(JSON.stringify(ctx.update, null, 2))

    return next()
  })

  // use steps
  bot.use(steps)

  // // use menus
  // bot.use(menus.selectPaymentMethodInBot)
  // bot.use(menus.mainMenu)
  // bot.use(menus.selectPaymentMethod)
  // bot.use(menus.confirmStickerSet)
  // bot.use(menus.confirmSelectStickersDoneMenu)
  // bot.use(menus.selectStickersDoneMenu)

  // // use transformers
  // bot.api.config.use(deleteMessagesTransformer(bot.api))

  // // bot.api.config.use((prev, method, payload, signal) => {
  // //   console.log(JSON.stringify({ method, payload }, null, 2))
  // //   return prev(method, payload, signal)
  // // })

  // // if bot is disabled, don't handle any message
  // if (options.config.bot.disabled) {
  //   return bot
  // }

  // // use commands
  // bot.command('start', commands.start)

  // // use routes
  // bot.use(router)

  // // handle pre-checkout query
  // bot.on('pre_checkout_query', (ctx) => {
  //   console.log('pre_checkout_query', JSON.stringify(ctx))

  //   return ctx.answerPreCheckoutQuery(true)
  // })

  // // TODO: get rid of this. Use LiqPay webhooks instead.
  // // handle successful payment
  // bot.on(':successful_payment', async (ctx) => {
  //   const logger = ctx.logger.child({ name: 'successful_payment', user_id: ctx.from!.id })

  //   try {
  //     // clear order info from session
  //     const session = await ctx.session
  //     session.order = {}
  //     logger.debug('cleared order info from session')

  //     // change route to main menu
  //     session.route = Routes.Welcome

  //     // show success message to user
  //     await ctx.reply(successfulPaymentText.text, {
  //       reply_markup: mainMenu,
  //       parse_mode: successfulPaymentText.parseMode,
  //       deleteInFuture: true,
  //     })
  //   } catch (error) {
  //     logger.error(`failed to handle successful payment: ${error}`)
  //   }
  // })

  // // handle unhandled errors
  // bot.catch((err) => {
  //   const { ctx } = err
  //   console.error(`Error while handling update ${ctx.update.update_id}:`)

  //   const e = err.error

  //   if (e instanceof GrammyError) {
  //     console.error('Error in request:', e.description)
  //   } else if (e instanceof HttpError) {
  //     console.error('Could not contact Telegram:', e)
  //   } else {
  //     console.error('Unknown error:', e)
  //   }
  // })

  return bot
}
