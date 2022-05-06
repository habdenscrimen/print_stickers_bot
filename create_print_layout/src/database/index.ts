import { Database } from 'firebase-admin/database'
import { OrderStatus } from '../types'

/** getConfirmedOrderIDs retrieves confirmed order ids from database */
const getConfirmedOrderIDs = async (db: Database): Promise<string[]> => {
  try {
    console.info(`ℹ️  getting confirmed orders from database`)

    // get data snapshot
    const snapshot = await db
      .ref('orders')
      .orderByChild('status')
      .equalTo('confirmed')
      .get()

    // get snapshot value
    const orders = snapshot.val()
    if (!orders) {
      console.info('ℹ️  no confirmed orders found')
      return []
    }

    // get confirmed order ids from snapshot value
    const confirmedOrderIDs = Object.keys(orders)

    console.info(`✅ successfully got confirmed orders from database`)
    return confirmedOrderIDs
  } catch (error) {
    console.error(`failed to get confirmed orders: ${error}`)
    return []
  }
}

/** getOrderStatus updates order status in database */
const updateOrderStatus = async (
  db: Database,
  orderID: string,
  status: OrderStatus,
): Promise<void> => {
  try {
    console.info(`ℹ️  updating order ${orderID} status to ${status}`)

    // update order status
    await db.ref(`orders/${orderID}`).update({ status })

    console.info(`✅ successfully updated order ${orderID} status to ${status}`)
  } catch (error) {
    console.error(`❌ failed to update order ${orderID} status to ${status}: ${error}`)
  }
}

export default {
  getConfirmedOrderIDs,
  updateOrderStatus,
}
