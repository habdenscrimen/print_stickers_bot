import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { Marshaller } from '@aws/dynamodb-auto-marshaller'
import { User } from 'internal/domain'
import { UserRepo } from '.'

type Handler<HandlerName extends keyof UserRepo> = (
  dbClient: DynamoDBClient,
  args: Parameters<UserRepo[HandlerName]>,
) => ReturnType<UserRepo[HandlerName]>

export const newUserRepo = (db: DynamoDBClient): UserRepo => {
  return {
    GetUserByID: (...args) => getUserByID(db, [...args]),
  }
}

const marshaller = new Marshaller({ unwrapNumbers: true, onEmpty: 'omit' })

/** getUserByID gets user by id. */
const getUserByID: Handler<'GetUserByID'> = async (db, [{ userID }]) => {
  const data = await db.send(
    new GetItemCommand({
      TableName: 'users',
      Key: {
        telegram_user_id: {
          N: userID.toString(),
        },
      },
    }),
  )

  const response = marshaller.unmarshallItem(data.Item!)

  return response as unknown as User | undefined
}
