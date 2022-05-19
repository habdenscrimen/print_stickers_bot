import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
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

export const createOrder: Handler<'CreateOrder'> = async (db, [order]) => {
  try {
    const orderID = customAlphabet(lowercase, 20)()

    const now = new Date().toISOString()

    await db
      .collection('orders')
      .doc(orderID)
      .set({
        ...order,
        created_at: now,
        events: [{ confirmed: now }],
      } as Order)

    return orderID
  } catch (error) {
    throw new Error(`failed to create order: ${error}`)
  }
}

export const addOrderEvent: Handler<'AddOrderEvent'> = async (
  db,
  [orderID, eventType],
) => {
  try {
    const now = new Date()

    // get existing order events
    const orderRef = db.collection('orders').doc(orderID)
    const orderSnapshot = await orderRef.get()
    const events = (orderSnapshot.data() as Order).events || []

    // add order event
    await db
      .collection('orders')
      .doc(orderID)
      .update({
        events: [...events, { [eventType]: now }],
      } as Order)
  } catch (error) {
    throw new Error(`failed to add order event: ${error}`)
  }
}
