import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { Marshaller } from '@aws/dynamodb-auto-marshaller'
import { Order } from 'internal/domain'
import { OrderRepo } from '.'

type Handler<HandlerName extends keyof OrderRepo> = (
  dbClient: DynamoDBClient,
  args: Parameters<OrderRepo[HandlerName]>,
) => ReturnType<OrderRepo[HandlerName]>

export const newOrderRepo = (db: DynamoDBClient): OrderRepo => {
  return {
    GetOrders: (...args) => getOrders(db, [...args]),
  }
}

const marshaller = new Marshaller({ unwrapNumbers: true, onEmpty: 'omit' })

const getOrders: Handler<'GetOrders'> = async (db) => {
  const data = await db.send(
    new ScanCommand({
      TableName: 'orders',
      ReturnConsumedCapacity: 'TOTAL',
    }),
  )

  const response = data.Items?.map((item) => marshaller.unmarshallItem(item))

  return response as unknown as Order[]
}
