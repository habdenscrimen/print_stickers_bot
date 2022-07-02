// Create service client module using ES6 syntax.
import {
  CreateTableCommand,
  CreateTableCommandInput,
  DynamoDBClient,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb'
import { Config } from 'config'

// define tables
const tables: CreateTableCommandInput[] = [
  {
    TableName: 'bot_session',
    AttributeDefinitions: [
      {
        AttributeName: 'user_id',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'user_id',
        KeyType: 'HASH',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  },
  {
    TableName: 'users',
    AttributeDefinitions: [
      {
        AttributeName: 'telegram_user_id',
        AttributeType: 'N',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'telegram_user_id',
        KeyType: 'HASH',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  },
  {
    TableName: 'orders',
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  },
]

interface Options {
  config: Config
}

export const NewDbClient = async (options: Options): Promise<DynamoDBClient> => {
  // Create an Amazon DynamoDB service client object.
  const client = new DynamoDBClient({
    region: 'eu-central-1',
    endpoint: options.config.app.env === 'development' ? 'http://localhost:8000' : undefined,
  })

  const existingTables = await client.send(new ListTablesCommand({}))

  // create tables if not exists
  await Promise.all(
    tables.map(async (table) => {
      if (!existingTables.TableNames?.includes(table.TableName!)) {
        await client.send(new CreateTableCommand(table))
      }
    }),
  )

  return client
}
