import admin from 'firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { UsersRepo } from '.'
import { User } from '../domain'

type Handler<HandlerName extends keyof UsersRepo> = (
  database: admin.firestore.Firestore,
  args: Parameters<UsersRepo[HandlerName]>,
) => ReturnType<UsersRepo[HandlerName]>

export const newUsersRepo = (db: admin.firestore.Firestore): UsersRepo => {
  return {
    GetUserByID: (...args) => getUserByID(db, [...args]),
    GetUserByData: (...args) => getUserByData(db, [...args]),
    UpdateUser: (...args) => updateUser(db, [...args]),
    CreateUser: (...args) => createUser(db, [...args]),
  }
}

/** getUserByID gets user by id. */
const getUserByID: Handler<'GetUserByID'> = async (db, [userID]) => {
  const snapshot = await db.collection('users').doc(userID.toString()).get()

  if (!snapshot.exists) {
    return undefined
  }

  return snapshot.data() as User
}

/** getUserByID gets user by its fields.s */
const getUserByData: Handler<'GetUserByData'> = async (db, [data]) => {
  const collection = db.collection('users')
  let snapshot: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = undefined as any

  /* eslint-disable-next-line */
  for (const [key, value] of Object.entries(data)) {
    snapshot = collection.where(key, '==', value)
  }

  const response = await snapshot.limit(1).get()

  if (response.empty) {
    return undefined
  }

  return response.docs[0].data() as User
}

/** updateUser updates user fields without clearing not passed fields. */
const updateUser: Handler<'UpdateUser'> = async (db, [telegramUserID, user, options]) => {
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
}

/** createUser creates a new user. */
const createUser: Handler<'CreateUser'> = async (db, [telegramUserID, user]) => {
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
      // free_stickers_count: 0,
      // FIXME: set back to 0!
      free_stickers_count: 3,
    } as User)
}
