import * as functions from 'firebase-functions'
import { webhookCallback } from 'grammy'

import { newConfig } from '../config'
import { newApp } from '../internal/app'

const config = newConfig()
const { bot } = newApp(config)

export const botWebhooksHandler = functions
  .region(config.functions.region)
  .https.onRequest(webhookCallback(bot))
