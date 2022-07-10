import { Config } from 'config'
import { Repos } from 'internal/repos'
import { Logger } from 'pkg/logger'
import { UserService } from '.'

interface UserServiceOptions {
  repos: Repos
  config: Config
  logger: Logger
}

type Service<HandlerName extends keyof UserService> = (
  options: UserServiceOptions,
  args: Parameters<UserService[HandlerName]>,
) => ReturnType<UserService[HandlerName]>

export const newUserService = (options: UserServiceOptions): UserService => {
  return {
    GetUserByID: (...args) => getUserByID(options, args),
    CreateUser: (...args) => createUser(options, args),
    IsContactSaved: (...args) => isContactSaved(options, args),
    SaveContact: (...args) => saveContact(options, args),
  }
}

const getUserByID: Service<'GetUserByID'> = async ({ logger, repos }, [{ telegramUserID }]) => {
  let log = logger.child({ name: 'user-getUserByID' })

  try {
    const user = await repos.User.GetUserByID({ userID: telegramUserID })
    log = log.child({ user })
    log.debug(`got user`)

    return user
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to get user by ID: ${error}`)
    throw new Error(`failed to get user by ID: ${error}`)
  }
}

export const createUser: Service<'CreateUser'> = async ({ repos, logger }, [{ user }]) => {
  let log = logger.child({ name: 'user-createUser', user })

  try {
    const newUser = await repos.User.CreateUser({
      user: {
        telegramUserID: user.telegram_user_id!,
        firstName: user.first_name!,
        lastName: user.last_name!,
        phoneNumber: user.phone_number!,
        username: user.username!,
        source: user.source!,
      },
    })
    log.debug(`user created`)

    return newUser
  } catch (error) {
    console.log('ERROR', error)

    log = log.child({ error })
    log.error(`failed to create user`)
    throw new Error(`failed to create user`)
  }
}

const isContactSaved: Service<'IsContactSaved'> = async ({ logger }, [{ ctx }]) => {
  let log = logger.child({ name: 'user-isContactSaved' })

  try {
    const session = await ctx.session
    const phoneNumber = session.user?.phone_number

    return !!phoneNumber
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to check whether contact is saved: ${error}`)
    throw new Error(`failed to check whether contact is saved: ${error}`)
  }
}

const saveContact: Service<'SaveContact'> = async ({ logger, repos }, [{ ctx }]) => {
  let log = logger.child({ name: 'user-saveContact' })

  try {
    const phoneNumber = ctx.message!.contact!.phone_number

    // save phone number to session
    const session = await ctx.session
    session.user = {
      ...session.user!,
      phone_number: phoneNumber,
    }

    // save phone number to user's db record
    await repos.User.SetPhoneNumber({ phoneNumber, userID: ctx.from!.id.toString() })
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to check whether contact is saved: ${error}`)
    throw new Error(`failed to check whether contact is saved: ${error}`)
  }
}
