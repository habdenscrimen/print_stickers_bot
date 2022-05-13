import { TelegramStickersService } from '.'

export const deleteStickerSet: TelegramStickersService<'DeleteStickerSet'> = async ([
  ctx,
  stickerSetName,
]) => {
  const logger = ctx.logger.child({ name: 'deleteStickerSet' })
  logger.debug({ stickerSetName })

  try {
    // get stickers from set
    const stickerSet = await ctx.api.getStickerSet(stickerSetName)
    logger.debug('got sticker set', { stickerSetName })

    // delete stickers from sticker set
    const deleteStickersPromise = stickerSet.stickers.map((sticker) =>
      ctx.api.deleteStickerFromSet(sticker.file_id),
    )
    await Promise.all(deleteStickersPromise)
    logger.debug('sticker set successfully deleted')
  } catch (error) {
    logger.error('failed to delete sticker set', { error })
  }
}
