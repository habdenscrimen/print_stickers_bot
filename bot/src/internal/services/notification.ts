import { Functions, httpsCallable } from 'firebase/functions'
import {
  AdminNotificationPayloads,
  NotificationPayload,
  NotificationService,
  TelegramService,
} from '.'
import { Config } from '../../config'
import { formatDate } from '../../pkg/date'
import { APIs } from '../api/api'
import { Logger } from '../logger'
import { Repos } from '../repos'

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

    console.time('addNotification')
    const addNotification = httpsCallable(functions, 'addNotification')
    await addNotification(payload)
    console.timeEnd('addNotification')

    log.info(`successfully added notification to notifications list`)
  } catch (error) {
    log.error(`failed to add notification: ${error}`)
  }
}

const createNotificationMessage = async (
  payload: NotificationPayload,
  repos: Repos,
  logger: Logger,
): Promise<string> => {
  const log = logger.child({ name: 'createNotificationMessage', payload })

  try {
    if (!payload.admin && !payload.user) {
      throw new Error('either admin or user must be defined')
    }

    if (payload.admin) {
      if (payload.admin.event === 'new_order') {
        const { orderID } = payload.admin.payload as AdminNotificationPayloads['new_order']
        const order = await repos.Orders.GetOrder(orderID)
        if (!order) {
          throw new Error(`order not found: ${orderID}`)
        }

        return `➕ Нове замовлення, ₴${order.stickers_cost}.`
      }

      if (payload.admin.event === 'order_cancelled') {
        const { orderID } = payload.admin
          .payload as AdminNotificationPayloads['order_cancelled']

        return `❌ Замовлення з ID ${orderID} автоматично відмінено.`
      }

      if (payload.admin.event === 'order_cancellation_requested') {
        const { orderID } = payload.admin
          .payload as AdminNotificationPayloads['order_cancellation_requested']

        return `⏳❌ Створений запит на відміну замовлення з ID ${orderID}.`
      }

      if (payload.admin.event === 'order_cannot_be_refunded') {
        const { orderID } = payload.admin
          .payload as AdminNotificationPayloads['order_cancellation_requested']

        return `⚠️ Непередбачувана ситуація — помилка при відміні замовлення з ID ${orderID}!`
      }
    }

    if (payload.user) {
      if (payload.user.event === 'order_refunded') {
        // get order by id
        const order = await repos.Orders.GetOrder(payload.user.payload.orderID)
        if (!order) {
          throw new Error(`order not found: ${payload.user.payload.orderID}`)
        }

        const cancellationEventDate = order.events.cancelled

        return `✅ Кошти за замовлення скасоване ${formatDate(cancellationEventDate)} (${
          order.stickers_cost
        } грн.) повернені.`
      }

      if (payload.user.event === 'admin_cancelled_order') {
        // get order by id
        const order = await repos.Orders.GetOrder(payload.user.payload.orderID)
        if (!order) {
          throw new Error(`order not found: ${payload.user.payload.orderID}`)
        }

        const cancellationRequestedEventDate = order.events.cancellation_pending

        return `✅ ${formatDate(
          cancellationRequestedEventDate,
        )} був створений запит на скасування замовлення на суму ${
          order.stickers_cost
        } грн.\nМи його успішно скасували, банк поверне кошти протягом місяця (зазвичай це відбувається швидше).`
      }
    }

    throw new Error('unknown notification event')
  } catch (error) {
    log.error(`failed to create notification message: ${error}`)
    throw new Error(`failed to create notification message: ${error}`)
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
