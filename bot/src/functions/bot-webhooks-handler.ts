import * as functions from 'firebase-functions'
import { webhookCallback } from 'grammy'

import { newConfig } from '../config'
import { newApp } from '../internal/app'

const config = newConfig()
const { bot } = newApp(config)

export default functions
  .region(config.functions.region)
  .runWith({
    minInstances: config.env === 'production' ? 1 : 0,
    timeoutSeconds: 540,
  })
  .https.onRequest(webhookCallback(bot))
