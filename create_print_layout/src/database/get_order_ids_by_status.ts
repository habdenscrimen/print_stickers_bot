import { Handler } from '.'

export const getOrderIDsByStatus: Handler<'GetOrderIDsByStatus'> = async (
  db,
  [statuses],
) => {
  const query = await db.collection('orders').where('status', 'in', statuses).get()
  const orderIDs = query.docs.map((doc) => doc.id)

  return orderIDs
}
