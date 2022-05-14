import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { Handler } from '.'
import { Order } from '../domain'

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
