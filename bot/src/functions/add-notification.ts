import * as functions from 'firebase-functions'
import { newConfig } from '../config'
import { newApp } from '../internal/app'

const config = newConfig()

export default functions.region(config.functions.region).https.onRequest(async (req, res) => {
  const { services, logger } = newApp(config)
  const log = logger.child({ name: 'add-notification-function', req })

  try {
    if (!req.body.data) {
      res.status(400).send('data is required')
      return
    }

    // send notification
    await services.Notification.SendNotification(req.body.data)

    log.info(`added notification`)
    res.status(200).send({ status: 'success', data: 'ok' })
  } catch (error) {
    log.error(`failed to add notification: ${error}`)
    res.status(500).send({ status: 'error', data: error })
  }
})
