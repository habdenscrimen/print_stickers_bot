import { NotificationsServices } from '..'
import { sendAdminNotification } from './send_admin_notification'
import { sendTelegramUserNotification } from './send_telegram_user_notification'

export type NotificationService<HandlerName extends keyof NotificationsServices> = (
  args: Parameters<NotificationsServices[HandlerName]>,
) => ReturnType<NotificationsServices[HandlerName]>

export const newNotificationsServices = (): NotificationsServices => {
  return {
    SendAdminNotification: (...args) => sendAdminNotification(args),
    SendTelegramUserNotification: (...args) => sendTelegramUserNotification(args),
  }
}
