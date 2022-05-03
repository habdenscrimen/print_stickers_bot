import { Database } from 'firebase-admin/database'

interface UserContact {
  username: string
  phone_number?: string
  first_name?: string
  last_name?: string
}

interface Order {
  user_id: number
  status:
    | 'unconfirmed'
    | 'confirmed'
    | 'print_ready'
    | 'printing'
    | 'delivery'
    | 'completed'
    | 'cancelled'
  delivery_address: string
}

/** saveUserContact saves user contact to database */
export const saveUserContact = async (
  db: Database,
  userID: number,
  userContact: UserContact,
) => {
  try {
    console.debug('saving user contact to database')

    await db.ref(`users/${userID}`).update(userContact)

    console.debug('successfully saved user contact to database')
  } catch (error) {
    console.error(`failed to save user contact: ${error}`)
  }
}

/** checkIfUserContactExists checks if user contact exists in database */
export const checkIfUserContactExists = async (db: Database, userID: number) => {
  try {
    console.debug('getting contact from database')

    const snapshot = await db.ref(`users/${userID}`).get()

    console.debug('successfully got contact from database')
    return snapshot.exists()
  } catch (error) {
    console.error(`failed to get contact from database: ${error}`)
    return false
  }
}

/** createOrder creates an order in database */
export const createOrder = async (db: Database, orderID: string, userID: number) => {
  try {
    console.debug('creating order')

    // const orderID = nanoid(10)

    await db.ref(`orders/${orderID}`).set({
      userID,
      status: 'unconfirmed',
    })

    console.debug('successfully created order')
  } catch (error) {
    console.error(`failed to create order: ${error}`)
  }
}

/** updateOrder updates order in database */
export const updateOrder = async (
  db: Database,
  orderID: string,
  order: Partial<Order>,
) => {
  try {
    console.debug('confirming order')

    await db.ref(`orders/${orderID}`).update(order)

    console.debug('successfully confirmed order')
  } catch (error) {
    console.error(`failed to confirm order: ${error}`)
  }
}

/** getOrder retrieves order from database */
export const getOrder = async (db: Database, orderID: string) => {
  try {
    console.debug('getting order')

    const snapshot = await db.ref(`orders/${orderID}`).get()

    console.debug('successfully got order')
    return snapshot.val() as Order
  } catch (error) {
    console.error(`failed to get order: ${error}`)
    return null
  }
}
