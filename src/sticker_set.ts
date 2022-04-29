import { CustomContext } from './bot'

/** deleteStickerSet deletes sticker set */
export const deleteStickerSet = async (ctx: CustomContext) => {
  console.debug('deleting sticker set', ctx.session.stickerSetName)

  // get temp sticker set
  const stickerSet = await ctx.telegram.getStickerSet(ctx.session.stickerSetName)

  // delete all stickers from temp sticker set
  const deleteStickersPromises = stickerSet.stickers.map((sticker) =>
    ctx.telegram.deleteStickerFromSet(sticker.file_id),
  )

  await Promise.all(deleteStickersPromises)
  console.debug('sticker set successfully deleted')
}
