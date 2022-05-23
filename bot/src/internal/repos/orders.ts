import admin from 'firebase-admin'
import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { OrdersRepo } from '.'
import { Order } from '../domain'

type Handler<HandlerName extends keyof OrdersRepo> = (
  database: admin.firestore.Firestore,
  args: Parameters<OrdersRepo[HandlerName]>,
) => ReturnType<OrdersRepo[HandlerName]>

export const newOrdersRepo = (db: admin.firestore.Firestore): OrdersRepo => {
  return {
    GetActiveUserOrders: (...args) => getActiveUserOrders(db, [...args]),
    CreateOrder: (...args) => createOrder(db, [...args]),
    AddOrderEvent: (...args) => addOrderEvent(db, [...args]),
    UpdateOrder: (...args) => updateOrder(db, [...args]),
  }
}

export const getActiveUserOrders: Handler<'GetActiveUserOrders'> = async (db, [userID]) => {
  const snapshot = await db
    .collection('orders')
    .where('user_id', '==', userID)
    .where('status', 'not-in', ['cancelled', 'completed'])
    .orderBy('status', 'desc')
    .orderBy('created_at', 'desc')
    .get()

  return snapshot.docs.map((doc) => doc.data() as Order)
}

export const createOrder: Handler<'CreateOrder'> = async (db, [order]) => {
  const orderID = customAlphabet(lowercase, 20)()

  const now = new Date().toISOString()

  await db
    .collection('orders')
    .doc(orderID)
    .set({
      ...order,
      created_at: now,
      events: [{ payment_pending: now }],
    } as Order)

  return orderID
}

export const addOrderEvent: Handler<'AddOrderEvent'> = async (db, [orderID, eventType]) => {
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
}

export const updateOrder: Handler<'UpdateOrder'> = async (db, [orderID, order]) => {
  const updatedOrder = order

  // if order status is changed, add order event
  if (order.status) {
    // get order
    const orderSnapshot = await db.collection('orders').doc(orderID).get()
    const dbOrder = orderSnapshot.data() as Order

    // add order event
    const now = new Date()
    const events = dbOrder.events || []
    updatedOrder.events = [...events, { [order.status]: now }] as Order['events']
  }

  await db.collection('orders').doc(orderID).update(updatedOrder)
}
