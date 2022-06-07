import { NotificationService, QuestionService } from '.'
import { Config } from '../../config'
import { APIs } from '../api/api'
import { Logger } from '../logger'
import { Repos } from '../repos'

interface QuestionServiceOptions {
  apis: APIs
  repos: Repos
  config: Config
  logger: Logger
  notificationService: NotificationService
}

type Service<HandlerName extends keyof QuestionService> = (
  options: QuestionServiceOptions,
  args: Parameters<QuestionService[HandlerName]>,
) => ReturnType<QuestionService[HandlerName]>

export const newQuestionService = (options: QuestionServiceOptions): QuestionService => {
  return {
    CreateQuestion: (...args) => createQuestion(options, args),
    GetUnansweredQuestions: (...args) => getUnansweredQuestions(options, args),
    AnswerQuestion: (...args) => answerQuestion(options, args),
  }
}

const createQuestion: Service<'CreateQuestion'> = async (
  { logger, repos, notificationService },
  [{ question }],
) => {
  let log = logger.child({ name: 'createQuestion', question })

  try {
    // create question in database
    const questionID = await repos.Questions.CreateQuestion(question)
    log = log.child({ question_id: questionID })
    log.debug(`question created with`)

    // create admin notification about new question
    notificationService.AddNotification({
      admin: { event: 'new_question', payload: { questionID } },
    })

    return questionID
  } catch (error) {
    log.error(`failed to create order: ${error}`)
    throw new Error(`failed to create order: ${error}`)
  }
}

const getUnansweredQuestions: Service<'GetUnansweredQuestions'> = async ({ logger, repos }) => {
  const log = logger.child({ name: 'getUnansweredQuestions' })

  try {
    const questions = await repos.Questions.GetUnansweredQuestions()
    log.debug(`got questions: ${questions}`)

    return questions
  } catch (error) {
    log.error(`failed to get questions: ${error}`)
    throw new Error(`failed to get questions: ${error}`)
  }
}

const answerQuestion: Service<'AnswerQuestion'> = async (
  { logger, repos, notificationService },
  [{ questionID, answer }],
) => {
  const log = logger.child({ name: 'answerQuestion', question_id: questionID, answer })

  try {
    // make sure question is unanswered
    const question = await repos.Questions.GetQuestion({ questionID })
    if (!question) {
      log.error(`question not found: ${questionID}`)
      throw new Error(`question not found: ${questionID}`)
    }
    if (question.answered_at) {
      log.error(`question already answered: ${questionID}`)
      throw new Error(`question already answered: ${questionID}`)
    }

    // update question in database
    await repos.Questions.UpdateQuestion({
      questionID,
      question: {
        answer,
        answered_at: new Date().toISOString(),
      },
    })
    log.debug(`question answered: ${questionID}`)

    // send user notification with answer
    await notificationService.AddNotification({
      user: {
        event: 'question_answered',
        payload: { telegramChatID: question.user_id, questionID: question.id },
      },
    })
  } catch (error) {
    log.error(`failed to get questions: ${error}`)
    throw new Error(`failed to get questions: ${error}`)
  }
}
