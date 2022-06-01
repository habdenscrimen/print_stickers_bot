import faker from '@faker-js/faker'
import { newUsersRepo } from '../src/internal/repos/users'
import { initFirebase } from '../src/pkg/firebase'
import { newConfig } from '../src/config'
import { UsersRepo } from '../src/internal/repos'

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
const config = newConfig()
const { firestore } = initFirebase(config)
const usersRepo = newUsersRepo(firestore)

const userIDs: number[] = []

const insertUsers = async (repo: UsersRepo, count: number) => {
  const promises = new Array(count).fill(0).map(async () => {
    const userID = Number(faker.random.numeric(10))

    userIDs.push(userID)

    await repo.CreateUser(userID, {
      username: faker.internet.userName(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      telegram_chat_id: userID,
    })
  })

  await Promise.all(promises)
}

const start = async (repo: UsersRepo) => {
  await insertUsers(repo, 1)

  const user = await repo.GetUserByID(userIDs[0])

  console.log(`https://t.me/print_stickers_ua_bot?start=${user!.referral_code}`)
}

start(usersRepo)
