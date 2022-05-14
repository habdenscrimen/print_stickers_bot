import { Handler } from '.'
import { Order } from '../domain'

export const getOrder: Handler<'GetOrder'> = async (db, [orderID]) => {
  const query = await db.collection('orders').doc(orderID).get()
  if (!query.exists) {
    throw new Error(`Order ${orderID} does not exist`)
  }

  return query.data() as Order
}
