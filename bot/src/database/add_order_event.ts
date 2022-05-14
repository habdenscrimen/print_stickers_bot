import { Handler } from '.'
import { Order } from '../domain'

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
