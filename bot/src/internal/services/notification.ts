import { Functions, httpsCallable } from 'firebase/functions'
import { NotificationService, TelegramService } from '.'
import { Config } from '../../config'
import { APIs } from '../api/api'
import { Logger } from '../logger'
import { Repos } from '../repos'
import { createNotificationMessage } from './create_notification_message'

interface NotificationServiceOptions {
  apis: APIs
  repos: Repos
  config: Config
  logger: Logger
  telegramService: TelegramService
  functions: Functions
}

type Service<HandlerName extends keyof NotificationService> = (
  options: NotificationServiceOptions,
  args: Parameters<NotificationService[HandlerName]>,
) => ReturnType<NotificationService[HandlerName]>

export const newNotificationService = (
  options: NotificationServiceOptions,
): NotificationService => {
  return {
    AddNotification: (...args) => addNotification(options, args),
    SendNotification: (...args) => sendNotification(options, args),
  }
}

/** Adds notification to the list (queue, etc). */
const addNotification: Service<'AddNotification'> = async (
  { logger, functions },
  [payload],
) => {
  const log = logger.child({ name: 'addNotification', payload })

  try {
    log.debug('adding notification to notifications list')

    const addNotification = httpsCallable(functions, 'functions-addNotification')
    await addNotification(payload)

    log.info(`successfully added notification to notifications list`)
  } catch (error) {
    log.error(`failed to add notification: ${error}`)
  }
}

/* eslint-disable no-case-declarations */
/** Adds notification to the list (queue, etc). */
const sendNotification: Service<'SendNotification'> = async (
  { logger, telegramService, config, repos },
  [payload],
) => {
  const log = logger.child({ name: 'sendNotification', payload })

  try {
    // check if admin's or user's payload is provided
    if (!payload.admin && !payload.user) {
      throw new Error(`user or admin payload is required`)
    }

    if (payload.admin) {
      const message = await createNotificationMessage(payload, repos, log)

      // send message to Telegram admin's chat
      await telegramService.SendMessage(
        config.notifications.telegram.adminNotificationsChatID,
        message,
      )

      log.info(`successfully sent admin notification`)
      return
    }

    if (payload.user) {
      const message = await createNotificationMessage(payload, repos, log)

      await telegramService.SendMessage(payload.user.payload.telegramChatID, message)

      log.info(`successfully sent user notification`)
      return
    }
  } catch (error) {
    log.error(`failed to send notification: ${error}`)
  }
}
