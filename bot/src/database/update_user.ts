import { Handler } from '.'

export const updateUser: Handler<'UpdateUser'> = async (db, [userID, user]) => {
  return db.ref(`users/${userID}`).update(user)
}
