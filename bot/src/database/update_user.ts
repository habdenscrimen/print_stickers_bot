import { Handler } from '.'
import { User } from '../domain'

export const updateUser: Handler<'UpdateUser'> = async (db, [userID, user]) => {
  try {
    const now = new Date().toISOString()

    await db
      .collection('users')
      .doc(userID.toString())
      .set({ ...user, created_at: user.created_at || now } as User)
  } catch (error) {
    throw new Error(`failed to update user: ${error}`)
  }
}
