import * as functions from 'firebase-functions'
import { newConfig } from '../config'
import { newApp } from '../internal/app'

const config = newConfig()

export default functions.region(config.functions.region).https.onRequest(async (req, res) => {
  const { services, logger } = newApp(config)
  let log = logger.child({ name: 'admin-get-unanswered-questions-handler', req })

  try {
    // get unanswered questions
    const unansweredQuestions = await services.Question.GetUnansweredQuestions()
    log = log.child({ unansweredQuestions })
    log.info(`successfully got unanswered questions`)

    // send response
    res.status(200).send({ status: 'success', data: unansweredQuestions })
  } catch (error) {
    res
      .status(500)
      .send({ status: 'error', data: `failed to get unanswered questions: ${error}` })
  }
})
