import { Handler } from '.'

export const getConfirmedOrderFileIDs: Handler<'GetConfirmedOrderFileIDs'> = async (
  db,
) => {
  const query = await db.collection('orders').where('status', '==', 'confirmed').get()

  const telegramFileIDs = query.docs.reduce((acc, doc) => {
    const telegramFileIDs = doc.data().telegram_sticker_file_ids
    return acc.concat(telegramFileIDs)
  }, [])

  return telegramFileIDs
}
