import { Handler } from '.'
import { User } from '../domain'

export const getUserByData: Handler<'GetUserByData'> = async (db, [data]) => {
  try {
    const collection = db.collection('users')
    let snapshot: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      undefined as any

    /* eslint-disable-next-line */
    for (const [key, value] of Object.entries(data)) {
      snapshot = collection.where(key, '==', value)
    }

    const response = await snapshot.limit(1).get()

    if (response.empty) {
      return undefined
    }

    return response.docs[0].data() as User
  } catch (error) {
    console.error(`failed to get user by data: ${error}`)
    throw new Error(`failed to get user by data: ${error}`)
  }
}
