import { UserService } from '.'
import { Config } from '../../config'
import { APIs } from '../api/api'
import { Logger } from '../logger'
import { Repos } from '../repos'

interface NotificationServiceOptions {
  apis: APIs
  repos: Repos
  config: Config
  logger: Logger
}

type Service<HandlerName extends keyof UserService> = (
  options: NotificationServiceOptions,
  args: Parameters<UserService[HandlerName]>,
) => ReturnType<UserService[HandlerName]>

export const newUserService = (options: NotificationServiceOptions): UserService => {
  return {
    UpdateUser: (...args) => updateUser(options, args),
  }
}

/** Adds notification to the list (queue, etc). */
const updateUser: Service<'UpdateUser'> = async (
  { logger, repos },
  [{ telegramUserID, user, options }],
) => {
  const log = logger.child({
    name: 'updateUser',
    telegram_user_id: telegramUserID,
    user,
    options,
  })

  try {
    await repos.Users.UpdateUser(telegramUserID, user, options)
    log.info(`successfully updated user`)
  } catch (error) {
    log.error(`failed to update user: ${error}`)
  }
}
