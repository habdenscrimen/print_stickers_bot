import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
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
    CreateUser: (...args) => createUser(db, [...args]),
    SetPhoneNumber: (...args) => setPhoneNumber(db, [...args]),
  }
}

const marshaller = new Marshaller({ unwrapNumbers: true })

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

  const unmarshaledData = !data.Item ? undefined : marshaller.unmarshallItem(data.Item)

  return unmarshaledData as User | undefined
}

/** createUser creates a new user. */
const createUser: Handler<'CreateUser'> = async (db, [{ user }]) => {
  try {
    const now = new Date().toISOString()

    const marshalledItem = marshaller.marshallItem({
      telegram_user_id: user.telegramUserID,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      created_at: now,
      source: user.source,
    })

    await db.send(
      new PutItemCommand({
        TableName: 'users',
        // @ts-expect-error
        Item: marshalledItem,
      }),
    )

    return {
      created_at: now,
      first_name: user.firstName,
      last_name: user.lastName,
      phone_number: user.phoneNumber,
      telegram_user_id: user.telegramUserID,
      username: user.username,
      source: user.source,
    }
  } catch (error) {
    throw new Error(`failed to create user: ${error}`)
  }
}

/** setPhoneNumber updates a phone number. */
const setPhoneNumber: Handler<'SetPhoneNumber'> = async (db, [{ userID, phoneNumber }]) => {
  await db.send(
    new UpdateItemCommand({
      TableName: 'users',
      Key: {
        telegram_user_id: {
          N: userID.toString(),
        },
      },
      UpdateExpression: 'set phone_number = :phone_number',
      ExpressionAttributeValues: {
        ':phone_number': { S: phoneNumber },
      },
    }),
  )
}
