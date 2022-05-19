import { NotificationService } from '.'
import { SendTelegramUserNotificationPayloads } from '..'
import { Database } from '../../database'

const createNotificationMessage = async <
  T extends keyof SendTelegramUserNotificationPayloads,
>(
  db: Database,
  event: T,
  payload: SendTelegramUserNotificationPayloads[T],
): Promise<string> => {
  try {
    // check if event type is `new_order_by_your_referral`
    if (event === 'new_order_by_your_referral') {
      const { userID, invitedUserID } =
        payload as SendTelegramUserNotificationPayloads['new_order_by_your_referral']

      // get user and invited user
      const [user, invitedUser] = await Promise.all([
        db.GetUserByID(userID),
        db.GetUserByID(invitedUserID),
      ])
      const invitedUserName = `${invitedUser?.first_name}${
        invitedUser?.last_name ? `${invitedUser?.last_name} ` : ''
      }`

      return `${invitedUserName} зробив(ла) своє перше замовлення стікерів за твоїм реферальним посиланням!\nВи отримали по 3 безкоштовних стікера 🚀\n\nЗараз у тебе ${
        user?.free_stickers_count || 0
      } безкоштовних стікерів 🎉`
    }

    // check if event type is `you_registered_by_referral`
    if (event === 'you_registered_by_referral') {
      const { invitedByUserID } =
        payload as SendTelegramUserNotificationPayloads['you_registered_by_referral']

      // get current user and the one who invited him
      const invitedByUser = await db.GetUserByID(invitedByUserID)
      const invitedByUserName = `${invitedByUser?.first_name}${
        invitedByUser?.last_name ? `${invitedByUser?.last_name} ` : ''
      }`

      return `Ти зробив(ла) своє перше замовлення за реферальним посиланням ${invitedByUserName}!\nВи отримали по 3 безкоштовних стікера 🚀`
    }

    return ''
  } catch (error) {
    throw new Error(`failed to create notification message: ${error}`)
  }
}

const getChatID = async <T extends keyof SendTelegramUserNotificationPayloads>(
  db: Database,
  event: T,
  payload: SendTelegramUserNotificationPayloads[T],
): Promise<number | undefined> => {
  if (event === 'new_order_by_your_referral') {
    const { userID } =
      payload as SendTelegramUserNotificationPayloads['new_order_by_your_referral']
    const user = await db.GetUserByID(userID)

    return user!.telegram_chat_id
  }

  if (event === 'you_registered_by_referral') {
    const { userChatID } =
      payload as SendTelegramUserNotificationPayloads['you_registered_by_referral']

    return userChatID
  }

  return undefined
}

// TODO: send notifications using queue
export const sendTelegramUserNotification: NotificationService<
  'SendTelegramUserNotification'
> = async ([ctx, event, payload]) => {
  const logger = ctx.logger.child({ name: 'sendTelegramUserNotification' })
  logger.debug({ event, payload })

  try {
    // create message
    const message = await createNotificationMessage(ctx.database, event, payload)
    logger.debug('created notification message', { message })

    // get chat id
    const chatID = await getChatID(ctx.database, event, payload)
    if (!chatID) {
      logger.error('chat id is not defined', { event, payload })
      return
    }
    logger.debug('got chat id', { chatID })

    // send message
    await ctx.api.sendMessage(chatID, message, { parse_mode: 'Markdown' })
    logger.debug('sent telegram user notification')
  } catch (error) {
    logger.error('failed to send telegram user notification', { error })
    throw error
  }
}
