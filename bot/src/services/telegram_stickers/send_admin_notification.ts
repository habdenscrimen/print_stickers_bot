import { TelegramStickersService } from '.'
import { SendAdminNotificationPayloads } from '..'

const createNotificationMessage = <T extends keyof SendAdminNotificationPayloads>(
  event: T,
  payload: SendAdminNotificationPayloads[T],
): string => {
  switch (event) {
    case 'new_order':
      return `📦 Нове замовлення, ₴${(payload as { stickersCost: number }).stickersCost}`
    default:
      return ''
  }
}

export const sendAdminNotification: TelegramStickersService<
  'SendAdminNotification'
> = async ([ctx, event, payload]) => {
  const logger = ctx.logger.child({ name: 'sendAdminNotification' })
  logger.debug({ event, payload })

  try {
    // create message
    const message = createNotificationMessage(event, payload)
    logger.debug('created notification message', { message })

    // send message
    await ctx.api.sendMessage(ctx.config.telegram.adminNotificationsChatID, message, {
      parse_mode: 'MarkdownV2',
    })
    logger.debug('sent admin notification')
  } catch (error) {
    logger.error('failed to create admin notification', { error })
    throw error
  }
}
