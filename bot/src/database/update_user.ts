import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { Handler } from '.'
import { User } from '../domain'

export const updateUser: Handler<'UpdateUser'> = async (db, [userID, user]) => {
  try {
    const createdAt = user?.created_at || new Date().toISOString()
    const referralCode = user?.referral_code || customAlphabet(lowercase, 20)()

    await db
      .collection('users')
      .doc(userID.toString())
      .set({
        ...user,
        id: userID,
        created_at: createdAt,
        referral_code: referralCode,
      } as User)
  } catch (error) {
    throw new Error(`failed to update user with id ${userID}: ${error}`)
  }
}
