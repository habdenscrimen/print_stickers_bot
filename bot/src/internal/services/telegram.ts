import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { TelegramService } from '.'
import { goLike } from '../../pkg/function_exec'

type Service<HandlerName extends keyof TelegramService> = (
  args: Parameters<TelegramService[HandlerName]>,
) => ReturnType<TelegramService[HandlerName]>

export const newTelegramService = (): TelegramService => {
  return {
    CreateStickerSet: (...args) => createStickerSet(args),
    DeleteStickerSet: (...args) => deleteStickerSet(args),
  }
}

const createStickerSet: Service<'CreateStickerSet'> = async ([ctx, stickerFileIDs]) => {
  let logger = ctx.logger.child({ name: 'createStickerSet', user_id: ctx.from!.id })
  logger = logger.child({ stickerFileIDs })

  // generate random sticker pack name
  const prefix = customAlphabet(lowercase, 20)()
  const stickerSetName = `${prefix}_by_print_stickers_ua_bot`
  logger = logger.child({ stickerSetName })

  // get user
  const [user, getUserErr] = await goLike(ctx.repos.Users.GetUserByID(ctx.from!.id))
  if (getUserErr) {
    logger.error('failed to get user', { getUserErr })
    return [null, getUserErr]
  }
  if (!user) {
    logger.error('user not found')
    return [null, new Error('user not found')]
  }
  logger = logger.child({ user })

  // create sticker pack with 1st sticker
  await ctx.api.createNewStickerSet(
    ctx.from!.id,
    stickerSetName,
    `Мої стікери #${(user?.telegram_sticker_sets?.length || 0) + 1}`,
    '😆',
    { png_sticker: stickerFileIDs[0] },
  )
  logger.debug('created sticker set')

  // check if sticker set has 1 sticker
  if (stickerFileIDs.length === 1) {
    logger.debug('sticker set has 1 sticker', { stickerSetName })
    return [stickerSetName, null]
  }

  // add other stickers to sticker pack
  const addStickersToPackPromise = stickerFileIDs.slice(1).map((stickerFileID) =>
    ctx.api.addStickerToSet(ctx.from!.id, stickerSetName, '😆', {
      png_sticker: stickerFileID,
    }),
  )
  const [_, addStickersErr] = await goLike(Promise.all(addStickersToPackPromise))
  if (addStickersErr) {
    logger.error('failed to add stickers to set', { addStickersErr })
    return [null, addStickersErr]
  }
  logger.debug('added stickers to set')

  return [stickerSetName, null]
}

const deleteStickerSet: Service<'DeleteStickerSet'> = async ([ctx, stickerSetName]) => {
  let logger = ctx.logger.child({
    name: 'deleteStickerSet',
    user_id: ctx.from!.id,
    sticker_set_name: stickerSetName,
  })

  try {
    // get sticker set
    const stickerSet = await ctx.api.getStickerSet(stickerSetName)
    logger = logger.child({ stickerSet })
    logger.debug('got sticker set')

    // delete stickers from sticker set
    await Promise.all(
      stickerSet.stickers.map((sticker) => ctx.api.deleteStickerFromSet(sticker.file_id)),
    )
    logger.debug('deleted stickers from set')

    // get user (sticker set's owner)
    const user = await ctx.repos.Users.GetUserByID(ctx.from!.id)
    if (!user) {
      logger.debug(`user not found`, { user_id: ctx.from!.id })
      return
    }
    if (!user.telegram_sticker_sets) {
      logger.debug(`user has no sticker sets`, { user_id: ctx.from!.id })
      return
    }

    // update user's sticker sets (excluding deleted sticker set)
    await ctx.repos.Users.UpdateUser(user.telegram_user_id, {
      telegram_sticker_sets: user.telegram_sticker_sets.filter(
        (stickerSet) => stickerSet !== stickerSetName,
      ),
    })
    logger.debug('updated user sticker sets')

    logger.debug('sticker set deleted')
  } catch (error) {
    logger.error(`failed to delete sticker set: ${error}`)
  }
}
