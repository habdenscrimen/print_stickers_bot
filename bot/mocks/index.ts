import { getFirestore } from 'firebase-admin/firestore'
import { faker } from '@faker-js/faker'
import { User } from '../src/domain'
import { newConfig } from '../src/config'
import { initFirebase } from '../src/firebase'

// init db
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
const config = newConfig()
initFirebase(config)
const db = getFirestore()

// users
const mockUsers = async () => {
  const insertUsersPromise = [...new Array(1).keys()].map(() => {
    const userID = Number(faker.random.numeric(9))

    return db
      .collection('users')
      .doc(userID.toString())
      .set({
        id: userID,
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        phone_number: faker.phone.phoneNumber(),
        referral_code: faker.random.alphaNumeric(10),
        username: faker.internet.userName(),
        free_stickers_count: 0,
        telegram_sticker_sets: [],
        created_at: new Date().toISOString(),
      } as User)
  })

  await Promise.all(insertUsersPromise)
}

// insert entities
Promise.all([mockUsers()])
