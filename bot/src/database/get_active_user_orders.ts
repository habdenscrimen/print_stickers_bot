import { Handler } from '.'
import { Order } from '../domain'

export const getActiveUserOrders: Handler<'GetActiveUserOrders'> = async (
  db,
  [userID],
) => {
  try {
    const snapshot = await db
      .collection('orders')
      .where('user_id', '==', userID)
      .where('status', 'not-in', ['cancelled', 'completed'])
      .orderBy('status', 'desc')
      .orderBy('created_at', 'desc')
      .get()

    return snapshot.docs.map((doc) => doc.data() as Order)
  } catch (error) {
    console.error(`failed to get user orders: ${error}`)
    throw new Error(`failed to get user orders: ${error}`)
  }
}
