import { AdminNotificationPayloads, NotificationPayload, UserNotificationPayloads } from '.'
import { formatDate } from '../../pkg/date'
import { Logger } from '../logger'
import { Repos } from '../repos'

export const createNotificationMessage = async (
  payload: NotificationPayload,
  repos: Repos,
  logger: Logger,
): Promise<string> => {
  let log = logger.child({ name: 'createNotificationMessage', payload })

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
        log = log.child({ order })

        return `➕ Нове замовлення, ₴${order.stickers_cost}, ID: ${orderID}.`
      }

      if (payload.admin.event === 'order_cancelled') {
        const { orderID } = payload.admin
          .payload as AdminNotificationPayloads['order_cancelled']

        return `❌ Замовлення автоматично відмінено, ID: ${orderID}.`
      }

      if (payload.admin.event === 'order_cancellation_requested') {
        const { orderID } = payload.admin
          .payload as AdminNotificationPayloads['order_cancellation_requested']

        return `⏳❌ Створений запит на відміну замовлення, ID: ${orderID}.`
      }

      if (payload.admin.event === 'order_cannot_be_refunded') {
        const { orderID } = payload.admin
          .payload as AdminNotificationPayloads['order_cancellation_requested']

        return `⚠️ Непередбачувана ситуація — помилка при відміні замовлення з ID ${orderID}!`
      }

      if (payload.admin.event === 'new_question') {
        const { questionID } = payload.admin
          .payload as AdminNotificationPayloads['new_question']

        return `➕ Нове питання, ID: ${questionID}.`
      }
    }

    if (payload.user) {
      if (payload.user.event === 'order_refunded') {
        const { orderID } = payload.user.payload as UserNotificationPayloads['order_refunded']

        // get order by id
        const order = await repos.Orders.GetOrder(orderID)
        if (!order) {
          throw new Error(`order not found: ${orderID}`)
        }
        log = log.child({ order })

        const cancellationEventDate = order.events.cancelled

        return `✅ Кошти за замовлення скасоване ${formatDate(cancellationEventDate)} (${
          order.stickers_cost
        } грн.) повернені.`
      }

      if (payload.user.event === 'admin_cancelled_order') {
        const { orderID } = payload.user
          .payload as UserNotificationPayloads['admin_cancelled_order']

        // get order by id
        const order = await repos.Orders.GetOrder(orderID)
        if (!order) {
          throw new Error(`order not found: ${orderID}`)
        }
        log = log.child({ order })

        const cancellationRequestedEventDate = order.events.cancellation_pending

        return `✅ ${formatDate(
          cancellationRequestedEventDate,
        )} був створений запит на скасування замовлення на суму ${
          order.stickers_cost
        } грн.\nМи його успішно скасували, банк поверне кошти протягом місяця (зазвичай це відбувається швидше).`
      }

      if (payload.user.event === 'order_by_your_referral_code') {
        const { orderID } = payload.user
          .payload as UserNotificationPayloads['order_by_your_referral_code']

        // get order by id
        const order = await repos.Orders.GetOrder(orderID)
        if (!order) {
          throw new Error(`order not found: ${orderID}`)
        }
        log = log.child({ order })

        // get order's owner
        const orderOwner = await repos.Users.GetUserByID(order.user_id)
        if (!orderOwner) {
          throw new Error(`user not found: ${order.user_id}`)
        }
        log = log.child({ order_owner: orderOwner })

        // create user name
        const userName = `${orderOwner.first_name}${
          orderOwner.last_name ? ` ${orderOwner.last_name}` : ''
        }`
        log = log.child({ user_name: userName })

        return `🎉 ${userName} зробив(ла) перше замовлення за твоїм реферальним повиланням! Ви удвох отримали по 3 безкоштовних наліпки!`
      }

      if (payload.user.event === 'question_answered') {
        const { questionID } = payload.user
          .payload as UserNotificationPayloads['question_answered']

        // get question by ID
        const question = await repos.Questions.GetQuestion({ questionID })
        if (!question) {
          throw new Error(`question not found`)
        }
        if (!question.answer || !question.answered_at) {
          throw new Error(`question is not answered`)
        }

        return `👌 Нещодавно Ви ставили наступне запитання: "${question.question}"\nВідповідаємо:\n\n${question.answer}\n\nℹ️ Якщо у Вас ще залишились питання, можете поставити їх за допомогою кнопки у головному меню.`
      }
    }

    throw new Error('unknown notification event')
  } catch (error) {
    log.error(`failed to create notification message: ${error}`)
    throw new Error(`failed to create notification message: ${error}`)
  }
}
