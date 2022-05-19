import { FieldValue } from 'firebase-admin/firestore'
import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { Handler } from '.'
import { User } from '../domain'

/** getUserByID gets user by id. */
export const getUserByID: Handler<'GetUserByID'> = async (db, [userID]) => {
  try {
    const snapshot = await db.collection('users').doc(userID.toString()).get()

    if (!snapshot.exists) {
      return undefined
    }

    return snapshot.data() as User
  } catch (error) {
    throw new Error(`failed to get user by id: ${userID}: ${error}`)
  }
}

/** getUserByID gets user by its fields.s */
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

/** updateUser updates user fields without clearing not passed fields. */
export const updateUser: Handler<'UpdateUser'> = async (
  db,
  [telegramUserID, user, options],
) => {
  try {
    const referralData: Partial<User> = {}

    if (options?.incrementFreeStickers) {
      referralData.free_stickers_count = FieldValue.increment(
        options.incrementFreeStickers,
      ) as unknown as number
    }

    if (options?.newInvitedUserID) {
      referralData.free_stickers_for_invited_user_ids = FieldValue.arrayUnion(
        options.newInvitedUserID,
      ) as unknown as number[]
    }

    if (options?.newTelegramStickerSet) {
      referralData.telegram_sticker_sets = FieldValue.arrayUnion(
        options.newTelegramStickerSet,
      ) as unknown as string[]
    }

    await db
      .collection('users')
      .doc(telegramUserID.toString())
      .update({ ...user, ...referralData } as User)
  } catch (error) {
    throw new Error(`failed to update user with id ${telegramUserID}: ${error}`)
  }
}

/** createUser creates a new user. */
export const createUser: Handler<'CreateUser'> = async (db, [telegramUserID, user]) => {
  try {
    const createdAt = new Date().toISOString()
    const referralCode = customAlphabet(lowercase, 20)()

    await db
      .collection('users')
      .doc(telegramUserID.toString())
      .set({
        ...user,
        telegram_user_id: telegramUserID,
        referral_code: referralCode,
        created_at: createdAt,
      } as User)
  } catch (error) {
    throw new Error(`failed to create user ${user}: ${error}`)
  }
}
