import { Database } from 'firebase-admin/database'

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

    // get confirmed order ids from snapshot value
    const confirmedOrderIDs = Object.keys(orders)

    console.info(`✅ successfully got confirmed orders from database`)
    return confirmedOrderIDs
  } catch (error) {
    console.error(`failed to get confirmed orders: ${error}`)
    return []
  }
}

export default {
  getConfirmedOrderIDs,
}
