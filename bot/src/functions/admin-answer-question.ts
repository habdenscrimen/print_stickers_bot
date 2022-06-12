import * as functions from 'firebase-functions'
import { newConfig } from '../config'
import { newApp } from '../internal/app'

const config = newConfig()

export default functions.region(config.functions.region).https.onRequest(async (req, res) => {
  const { services, logger } = newApp(config)
  const log = logger.child({ name: 'admin-answer-question-handler', req })

  try {
    // get question ID and answer from request query
    const { question_id, answer } = req.query
    if (!question_id || !answer) {
      res.status(400).send('question_id and answer are required')
      return
    }

    // answer question
    await services.Question.AnswerQuestion({
      answer: answer as string,
      questionID: question_id as string,
    })
    log.debug(`successfully answered question ${question_id}`)

    // send response
    res.status(200).send({ status: 'success', data: 'ok' })
  } catch (error) {
    res.status(500).send({ status: 'error', data: `failed to answer question: ${error}` })
  }
})
