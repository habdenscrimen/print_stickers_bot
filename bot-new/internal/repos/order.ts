import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { Marshaller } from '@aws/dynamodb-auto-marshaller'
import { OrderRepo } from '.'

type Handler<HandlerName extends keyof OrderRepo> = (
  dbClient: DynamoDBClient,
  args: Parameters<OrderRepo[HandlerName]>,
) => ReturnType<OrderRepo[HandlerName]>

export const newOrderRepo = (db: DynamoDBClient): OrderRepo => {
  return {
    CreateOrder: (...args) => createOrder(db, [...args]),
  }
}

const marshaller = new Marshaller({ unwrapNumbers: true, onEmpty: 'omit' })

/** createOrder creates a new order. */
const createOrder: Handler<'CreateOrder'> = async (db, [{ order }]) => {
  const now = new Date().toISOString()

  const marshalledItem = marshaller.marshallItem({
    ...order,
    created_at: now,
    status: 'confirmed',
    events: { confirmed: now },
  })

  await db.send(
    new PutItemCommand({
      TableName: 'orders',
      // @ts-expect-error
      Item: marshalledItem,
    }),
  )
}
