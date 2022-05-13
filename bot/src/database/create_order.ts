import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { Handler } from '.'

export const createOrder: Handler<'CreateOrder'> = async (db, [order]) => {
  try {
    const orderID = customAlphabet(lowercase, 20)()

    await db.collection('orders').doc(orderID).set(order)

    return orderID
  } catch (error) {
    throw new Error(`failed to create order: ${error}`)
  }
}
