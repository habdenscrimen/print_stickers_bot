import { Handler } from '.'

export const getOrderIDsByStatus: Handler<'GetOrderIDsByStatus'> = async (
  db,
  [statuses],
) => {
  // get order ids
  const orderIDsPromise = statuses.map(async (status) => {
    // get snapshot
    const snapshot = await db.ref('orders').orderByChild('status').equalTo(status).get()

    // get snapshot value
    const orders = snapshot.val()
    if (!orders) {
      return []
    }

    // get order ids from snapshot value
    return Object.keys(orders)
  })

  const orderIDs = await Promise.all(orderIDsPromise)

  return orderIDs.flat()
}
