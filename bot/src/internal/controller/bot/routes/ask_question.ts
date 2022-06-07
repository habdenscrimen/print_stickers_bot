import { RouteHandler } from '.'

export const askQuestion: RouteHandler = (nextRoute) => async (ctx) => {
  let logger = ctx.logger.child({ name: 'ask-question-route', user_id: ctx.from!.id })

  try {
    if (!ctx.message?.text) {
      logger.debug('message is not text')
      await ctx.reply('Будь ласка, напишіть питання', {
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
      return
    }

    // create new question
    await ctx.services.Question.CreateQuestion({
      question: { question: ctx.message.text, user_id: ctx.from!.id },
    })
    logger.info(`successfully created question`)

    // send message about successfully created question
    const text = ctx.texts.FAQ.AskQuestionSuccess()

    await ctx.reply(text, {
      parse_mode: 'MarkdownV2',
      reply_markup: ctx.menus.Main.GoBackToMainMenu,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to handle 'Ask question' route`)
  }
}
