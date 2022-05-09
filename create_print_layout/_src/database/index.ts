import { Database } from 'firebase-admin/database'
import { Order, OrderStatus } from '../types'

/** getOrderIDsByStatus retrieves confirmed order ids from database */
const getOrderIDsByStatus = async (
  db: Database,
  statuses: OrderStatus[],
): Promise<string[]> => {
  try {
    console.info(`ℹ️  getting confirmed orders from database`)

    const orderIDs = await Promise.all(
      statuses.map(async (status) => {
        // get data snapshot
        const snapshot = await db
          .ref('orders')
          .orderByChild('status')
          .equalTo(status)
          .get()

        // get snapshot value
        const orders = snapshot.val()
        if (!orders) {
          console.info('ℹ️  no confirmed orders found')
          return []
        }

        // get confirmed order ids from snapshot value
        return Object.keys(orders)
      }),
    )

    console.info(`✅ successfully got confirmed orders from database`)
    return orderIDs.flat()
  } catch (error) {
    console.error(`❌ failed to get confirmed orders: ${error}`)
    return []
  }
}

/** getOrderStatus updates order status in database */
const updateOrder = async (
  db: Database,
  orderID: string,
  order: Partial<Order>,
): Promise<void> => {
  try {
    console.info(`ℹ️  updating order ${orderID}`)

    // update order status
    await db.ref(`orders/${orderID}`).update(order)

    console.info(`✅ successfully updated order ${orderID}`)
  } catch (error) {
    console.error(`❌ failed to update order ${orderID}: ${error}`)
  }
}

export default {
  getOrderIDsByStatus,
  updateOrder,
}
