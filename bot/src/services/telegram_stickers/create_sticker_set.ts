import { customAlphabet } from 'nanoid'
import { alphanumeric } from 'nanoid-dictionary'
import { TelegramStickersService } from '.'

export const createStickerSet: TelegramStickersService<'CreateStickerSet'> = async ([
  ctx,
  stickerFileIDs,
]) => {
  const logger = ctx.logger.child({ name: 'createStickerPack' })
  logger.debug({ stickerFileIDs })

  try {
    // generate random sticker pack name
    const prefix = customAlphabet(alphanumeric, 10)()
    const stickerSetName = `${prefix}_by_print_stickers_ua_bot`

    const { id: userID } = ctx.from!
    const userStickerPacks = ctx.user?.sticker_packs ?? []

    // create sticker pack with 1st sticker
    await ctx.api.createNewStickerSet(
      userID,
      stickerSetName,
      `Мої стікери #${(userStickerPacks?.length || 0) + 1}`,
      '😆',
      { png_sticker: stickerFileIDs[0] },
    )
    logger.debug('created sticker pack', { stickerSetName })

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
    logger.debug('added stickers to pack', { stickerSetName })

    return stickerSetName
  } catch (error) {
    logger.error('failed to create sticker pack', { error })
    throw error
  }
}
