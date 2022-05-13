import { Handler } from '.'

export const getUser: Handler<'GetUser'> = async (db, [userID]) => {
  const snapshot = await db.ref(`users/${userID}`).get()

  return snapshot.val()
}
