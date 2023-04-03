import { Config } from 'config'
import { StorageAdapter } from 'grammy'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

export const newStorageAdapter = <T>(
  config: Config,
  ddbClient: DynamoDBClient,
): StorageAdapter<T> => {
  const documentClient = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  })

  return {
    read: async (key: string) => {
      const data = await documentClient.send(
        new GetCommand({
          TableName: config.db.sessionTable,
          Key: {
            user_id: key,
          },
        }),
      )

      return data.Item as T | undefined
    },
    write: async (key: string, value: T) => {
      const writeData = Object.entries(value).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value,
        }),
        {},
      )

      // @ts-expect-error
      writeData.user_id = key

      await documentClient.send(
        new PutCommand({
          TableName: config.db.sessionTable,
          Item: writeData,
        }),
      )
    },
    delete: async (key: string) => {
      await documentClient.send(
        new PutCommand({
          TableName: config.db.sessionTable,
          Item: {
            user_id: key,
          },
        }),
      )
    },
  }
}
