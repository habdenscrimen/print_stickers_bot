import { Handler } from '.'

export const updateOrder: Handler<'UpdateOrder'> = async (db, [orderID, order]) => {
  await db.collection('orders').doc(orderID).update(order)
}
