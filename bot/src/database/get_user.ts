import { Handler } from '.'
import { User } from '../domain'

export const getUser: Handler<'GetUser'> = async (db, [userID]) => {
  const snapshot = await db.collection('users').doc(userID.toString()).get()

  if (!snapshot.exists) {
    return undefined
  }

  return snapshot.data() as User
}
