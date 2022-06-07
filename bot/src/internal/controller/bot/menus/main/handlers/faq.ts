import { MenuHandler } from '../..'
import { Routes } from '../../../routes'

export const faq: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({ name: 'main-menu: FAQ', user_id: ctx.from.id })

  try {
    const text = ctx.texts.FAQ.Title()
    logger = logger.child({ text })
    logger.debug(`created text`)

    // show FAQ section title
    await ctx.editMessageText(text, { parse_mode: 'MarkdownV2' })

    // navigate to FAQ submenu
    ctx.menu.nav('faq')
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to handle FAQ menu`)
  }
}

export const howLongIsOrderProcessing: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'faq: How long is order processing',
    user_id: ctx.from.id,
  })

  try {
    const text = ctx.texts.FAQ.HowLongIsOrderProcessing()
    logger = logger.child({ text })
    logger.debug(`created text`)

    await ctx.editMessageText(text, { parse_mode: 'MarkdownV2' })
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to handle 'How long is order processing menu'`)
  }
}

export const canCancelOrder: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'faq: Can cancel order',
    user_id: ctx.from.id,
  })

  try {
    const text = ctx.texts.FAQ.CanCancelOrder()
    logger = logger.child({ text })
    logger.debug(`created text`)

    await ctx.editMessageText(text, { parse_mode: 'MarkdownV2' })
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to handle 'Can cancel order'`)
  }
}

export const askQuestion: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'faq: Ask question',
    user_id: ctx.from.id,
  })

  try {
    // set route to `ask_question`
    const session = await ctx.session
    session.route = Routes.AskQuestion

    // navigate to `ask_question` submenu
    ctx.menu.nav('ask-question-submenu')

    const text = ctx.texts.FAQ.AskQuestion()
    logger = logger.child({ text })
    logger.debug(`created text`)

    await ctx.editMessageText(text, { parse_mode: 'MarkdownV2' })
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to handle 'Ask question'`)
  }
}
