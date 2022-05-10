import { Handler } from '.'

export const updateOrder: Handler<'UpdateOrder'> = async (db, [orderID, order]) => {
  return db.ref(`orders/${orderID}`).update(order)
}
