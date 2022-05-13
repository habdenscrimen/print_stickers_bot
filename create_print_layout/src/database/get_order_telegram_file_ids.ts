import { Handler } from '.'
import { Order } from '../domain'

export const getOrderTelegramFileIDs: Handler<'GetOrderTelegramFileIDs'> = async (
  db,
  [orderID],
) => {
  const query = await db.collection('orders').doc(orderID).get()
  if (!query.exists) {
    throw new Error(`Order ${orderID} does not exist`)
  }

  return (query.data() as Order).telegram_sticker_file_ids
}
