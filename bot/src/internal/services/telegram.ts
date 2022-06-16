import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { Logger } from 'pino'
import { TelegramService } from '.'
import { Config } from '../../config'
import { APIs } from '../api/api'
import { BotContext } from '../controller/bot'
import { Repos } from '../repos'

interface TelegramServiceOptions {
  apis: APIs
  repos: Repos
  config: Config
  logger: Logger
  tgApi: BotContext['api']
}

type Service<HandlerName extends keyof TelegramService> = (
  options: TelegramServiceOptions,
  args: Parameters<TelegramService[HandlerName]>,
) => ReturnType<TelegramService[HandlerName]>

export const newTelegramService = (options: TelegramServiceOptions): TelegramService => {
  return {
    CreateStickerSet: (...args) => createStickerSet(options, args),
    DeleteStickerSet: (...args) => deleteStickerSet(options, args),
    SendMessage: (...args) => sendMessage(options, args),
    AddStickerToSet: (...args) => addStickerToSet(options, args),
    RemoveStickerFromSet: (...args) => removeStickerFromSet(options, args),
  }
}

const sendMessage: Service<'SendMessage'> = async ({ logger, tgApi }, [chatID, text]) => {
  const log = logger.child({ name: 'sendMessage', chat_id: chatID, text })

  try {
    await tgApi.sendMessage(chatID, text)

    log.info(`successfully sent message`)
  } catch (error) {
    log.error(`failed to send message: ${error}`)
  }
}

const addStickerToSet: Service<'AddStickerToSet'> = async (
  { logger, tgApi, config },
  [{ userID, stickerFileID, stickerSetName }],
) => {
  let log = logger.child({
    name: 'createStickerSet',
    user_id: userID,
    first_sticker_file_id: stickerFileID,
    sticker_set_name: stickerSetName,
  })

  try {
    // avoid creating sticker set (using during development)
    if (config.bot.avoidCreatingStickerSet) {
      log.warn('avoid creating sticker set')
      return { stickerFileUniqueID: '' }
    }

    await tgApi.addStickerToSet(userID, stickerSetName, '😆', { png_sticker: stickerFileID })

    // get sticker from set
    const stickerSet = await tgApi.getStickerSet(stickerSetName)
    log = log.child({ stickerSet })
    log.debug('got sticker set')

    const lastSticker = stickerSet.stickers[stickerSet.stickers.length - 1]

    log.debug(`successfully added sticker to set`)
    return { stickerFileUniqueID: lastSticker.file_unique_id }
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to add sticker to set: ${error}`)
    throw new Error(`failed to add sticker to set: ${error}`)
  }
}

const createStickerSet: Service<'CreateStickerSet'> = async (
  { logger, repos, tgApi, config },
  [{ userID, firstStickerFileID }],
) => {
  let log = logger.child({
    name: 'createStickerSet',
    user_id: userID,
    first_sticker_file_id: firstStickerFileID,
  })

  try {
    // generate random sticker pack name
    const prefix = customAlphabet(lowercase, 20)()
    const { username } = config.bot
    const stickerSetName = `${prefix}_by_${username}`
    log = log.child({ stickerSetName })

    // avoid creating sticker set (using during development)
    if (config.bot.avoidCreatingStickerSet) {
      log.warn('avoid creating sticker set')
      return { stickerSetName, stickerFileUniqueID: '' }
    }

    // get user
    const user = await repos.Users.GetUserByID(userID)
    if (!user) {
      log.error('user not found')
      throw new Error('user not found')
    }
    log = log.child({ user })

    // create sticker pack with 1st sticker
    await tgApi.createNewStickerSet(
      userID,
      stickerSetName,
      `Мої наліпки #${(user?.telegram_sticker_sets?.length || 0) + 1}`,
      '😆',
      { png_sticker: firstStickerFileID },
    )
    log.debug('created sticker set')

    // get sticker from set
    const stickerSet = await tgApi.getStickerSet(stickerSetName)
    log = log.child({ stickerSet })
    log.debug('got sticker set')

    return { stickerSetName, stickerFileUniqueID: stickerSet.stickers[0].file_unique_id }
  } catch (error) {
    log.error(`failed to create sticker set: ${error}`)
    throw new Error(`failed to create sticker set: ${error}`)
  }
}

const deleteStickerSet: Service<'DeleteStickerSet'> = async (
  { logger, tgApi, repos, config },
  [userID, stickerSetName],
) => {
  let log = logger.child({
    name: 'deleteStickerSet',
    user_id: userID,
    sticker_set_name: stickerSetName,
  })

  try {
    // avoid creating sticker set (using during development)
    if (config.bot.avoidCreatingStickerSet) {
      log.warn('avoid deleting set')
      return
    }

    // get sticker set
    const stickerSet = await tgApi.getStickerSet(stickerSetName)
    log = log.child({ stickerSet })
    log.debug('got sticker set')

    // delete stickers from sticker set
    await Promise.all(
      stickerSet.stickers.map((sticker) => tgApi.deleteStickerFromSet(sticker.file_id)),
    )
    log.debug('deleted stickers from set')

    // get user (sticker set's owner)
    const user = await repos.Users.GetUserByID(userID)
    if (!user) {
      log.debug(`user not found`, { user_id: userID })
      return
    }
    if (!user.telegram_sticker_sets) {
      log.debug(`user has no sticker sets`, { user_id: userID })
      return
    }

    // update user's sticker sets (excluding deleted sticker set)
    await repos.Users.UpdateUser(user.telegram_user_id, {
      telegram_sticker_sets: user.telegram_sticker_sets.filter(
        (stickerSet) => stickerSet !== stickerSetName,
      ),
    })
    log.debug('updated user sticker sets')

    log.debug('sticker set deleted')
  } catch (error) {
    log.error(`failed to delete sticker set: ${error}`)
  }
}

const removeStickerFromSet: Service<'RemoveStickerFromSet'> = async (
  { logger, tgApi, config },
  [{ stickerFileID }],
) => {
  let log = logger.child({
    name: 'removeStickerFromSet',
    sticker_file_id: stickerFileID,
  })

  try {
    // avoid deleting sticker from set (using in development)
    if (config.bot.avoidCreatingStickerSet) {
      log.warn('avoid deleting sticker from set')
      return
    }

    // delete sticker from sticker set
    await tgApi.deleteStickerFromSet(stickerFileID)
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to remove sticker from set`)
  }
}
