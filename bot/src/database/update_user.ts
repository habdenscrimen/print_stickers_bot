import { Handler } from '.'

export const updateUser: Handler<'UpdateUser'> = async (db, [userID, user]) => {
  await db.collection('users').doc(userID.toString()).set(user)
}
