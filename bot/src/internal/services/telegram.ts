import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { Logger } from 'pino'
import { TelegramService } from '.'
import { Config } from '../../config'
import { goLike } from '../../pkg/function_exec'
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
  }
}

const createStickerSet: Service<'CreateStickerSet'> = async (
  { logger, repos, tgApi, config },
  [userID, stickerFileIDs],
) => {
  let log = logger.child({ name: 'createStickerSet', user_id: userID })
  log = log.child({ stickerFileIDs })

  // generate random sticker pack name
  const prefix = customAlphabet(lowercase, 20)()
  const stickerSetName = `${prefix}_by_print_stickers_ua_bot`
  log = log.child({ stickerSetName })

  // avoid creating sticker set (using during development)
  if (config.bot.avoidCreatingStickerSet) {
    log.warn('avoid creating sticker set')
    return [stickerSetName, null]
  }

  // get user
  const [user, getUserErr] = await goLike(repos.Users.GetUserByID(userID))
  if (getUserErr) {
    log.error('failed to get user', { getUserErr })
    return [null, getUserErr]
  }
  if (!user) {
    log.error('user not found')
    return [null, new Error('user not found')]
  }
  log = log.child({ user })

  // create sticker pack with 1st sticker
  await tgApi.createNewStickerSet(
    userID,
    stickerSetName,
    `Мої наліпки #${(user?.telegram_sticker_sets?.length || 0) + 1}`,
    '😆',
    { png_sticker: stickerFileIDs[0] },
  )
  log.debug('created sticker set')

  // check if sticker set has 1 sticker
  if (stickerFileIDs.length === 1) {
    log.debug('sticker set has 1 sticker', { stickerSetName })
    return [stickerSetName, null]
  }

  // add other stickers to sticker pack
  const addStickersToPackPromise = stickerFileIDs.slice(1).map((stickerFileID) =>
    tgApi.addStickerToSet(userID, stickerSetName, '😆', {
      png_sticker: stickerFileID,
    }),
  )
  const [_, addStickersErr] = await goLike(Promise.all(addStickersToPackPromise))
  if (addStickersErr) {
    log.error('failed to add stickers to set', { addStickersErr })
    return [null, addStickersErr]
  }
  log.debug('added stickers to set')

  return [stickerSetName, null]
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
      log.warn('avoid creating deleting set')
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
