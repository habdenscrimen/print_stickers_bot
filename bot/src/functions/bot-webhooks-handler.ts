import * as functions from 'firebase-functions'
import { webhookCallback } from 'grammy'

import { newConfig } from '../config'
import { newApp } from '../internal/app'

const config = newConfig()
const { bot } = newApp(config)

export default async (req: functions.https.Request, res: functions.Response) => {
  return webhookCallback(bot)(req, res)
}
