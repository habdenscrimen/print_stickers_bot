import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { TelegramService } from '.'

export const createStickerSet: TelegramService<'CreateStickerSet'> = async ([
  ctx,
  stickerFileIDs,
]) => {
  const logger = ctx.logger.child({ name: 'createStickerSet' })
  logger.debug({ stickerFileIDs: JSON.stringify(stickerFileIDs) })

  try {
    // generate random sticker pack name
    const prefix = customAlphabet(lowercase, 20)()
    const stickerSetName = `${prefix}_by_print_stickers_ua_bot`

    const { id: userID } = ctx.from!
    const user = await ctx.database.GetUserByID(userID)

    // create sticker pack with 1st sticker
    await ctx.api.createNewStickerSet(
      userID,
      stickerSetName,
      `Мої стікери #${(user?.telegram_sticker_sets?.length || 0) + 1}`,
      '😆',
      { png_sticker: stickerFileIDs[0] },
    )
    logger.debug('created sticker set', { stickerSetName })

    // check if sticker set has 1 sticker
    if (stickerFileIDs.length === 1) {
      logger.debug('sticker set has 1 sticker', { stickerSetName })
      return stickerSetName
    }

    // add other stickers to sticker pack
    const addStickersToPackPromise = stickerFileIDs.slice(1).map((stickerFileID) =>
      ctx.api.addStickerToSet(userID, stickerSetName, '😆', {
        png_sticker: stickerFileID,
      }),
    )
    await Promise.all(addStickersToPackPromise)
    logger.debug('added stickers to set', { stickerSetName })

    return stickerSetName
  } catch (error) {
    logger.error('failed to create sticker set', { error })
    throw error
  }
}
