import { Composer } from 'grammy'
import { BotContext } from '../context'
import { SessionSteps } from '../session'
import { askDeliveryInfoMessages } from './ask-delivery-info'

const messages = {
  noContactReceived: `Будь ласка, надішліть номер телефону, використовуючи кнопку *"Надіслати номер"* 👇`,
}

// create composer
export const askPhoneNumberComposer = new Composer<BotContext>()

// checkUpdate checks if this composer should handle incoming update
const checkUpdate = async (ctx: BotContext): Promise<boolean> => {
  const session = await ctx.session

  return session.step === SessionSteps.AskPhoneNumber
}

// composer body
askPhoneNumberComposer.use(async (ctx, next) => {
  const handleUpdate = await checkUpdate(ctx)

  if (!handleUpdate) {
    return next()
  }

  let logger = ctx.logger.child({ name: 'ask-phone-number-composer' })

  try {
    // check if phone number is already saved
    const isContactSaved = await ctx.services.User.IsContactSaved({ ctx })
    if (isContactSaved) {
      logger.debug(`contact already saved`)
      return next()
    }

    // check if phone number was sent
    if (!ctx.message?.contact) {
      await ctx.reply(messages.noContactReceived)
      return next()
    }

    // save phone number
    await ctx.services.User.SaveContact({ ctx })

    // set step to AskDeliveryInfo
    const session = await ctx.session
    session.step = SessionSteps.AskDeliveryInfo

    await ctx.reply(askDeliveryInfoMessages.entering, {
      reply_markup: {
        remove_keyboard: true,
      },
    })
    return next()
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to handle ask-phone-number composer: ${error}`)
    return next()
  }
})
