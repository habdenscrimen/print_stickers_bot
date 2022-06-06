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
    GetUserByID: (...args) => getUserByID(options, args),
    CreateUser: (...args) => createUser(options, args),
  }
}

export const createUser: Service<'CreateUser'> = async (
  { repos, logger },
  [{ telegramUserID, user }],
) => {
  let log = logger.child({ name: 'createUser', user_id: telegramUserID, user })

  try {
    const newUser = await repos.Users.CreateUser(telegramUserID, user)
    log.debug(`user created`)

    return newUser
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to create user`)
    throw new Error(`failed to create user`)
  }
}

const getUserByID: Service<'GetUserByID'> = async ({ logger, repos }, [{ telegramUserID }]) => {
  let log = logger.child({ name: 'getUserByID', user_id: telegramUserID })

  try {
    const user = await repos.Users.GetUserByID(telegramUserID)
    log = log.child({ user })
    log.debug(`got user`)

    return user
  } catch (error) {
    log.error(`failed to get user by ID: ${error}`)
    throw new Error(`failed to get user by ID: ${error}`)
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
