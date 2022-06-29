import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
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

  return data.Item as User | undefined
}

/** createUser creates a new user. */
const createUser: Handler<'CreateUser'> = async (db, [{ user }]) => {
  const now = new Date().toISOString()

  await db.send(
    new PutItemCommand({
      TableName: 'users',
      Item: {
        telegram_user_id: {
          N: user.telegramUserID.toString(),
        },
        username: {
          S: user.username!,
        },
        first_name: {
          S: user.firstName,
        },
        last_name: {
          S: user.lastName,
        },
        created_at: {
          S: now,
        },
      },
    }),
  )

  return {
    created_at: now,
    first_name: user.firstName,
    last_name: user.lastName,
    phone_number: user.phoneNumber,
    telegram_user_id: user.telegramUserID,
    username: user.username,
  }
}

/** setPhoneNumber updates a phone number. */
const setPhoneNumber: Handler<'SetPhoneNumber'> = async (db, [{ userID, phoneNumber }]) => {
  const now = new Date().toISOString()

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
