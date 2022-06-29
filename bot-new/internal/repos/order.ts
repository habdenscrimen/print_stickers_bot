import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { User } from 'internal/domain'
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

/** createOrder creates a new order. */
const createOrder: Handler<'CreateOrder'> = async (db, [{ order }]) => {
  const now = new Date().toISOString()

  await db.send(
    new PutItemCommand({
      TableName: 'orders',
      Item: {
        id: {
          S: order.id,
        },
        user_id: {
          N: order.user_id.toString(),
        },
        status: {
          S: 'confirmed',
        },
        delivery_address: {
          S: order.delivery_address,
        },
        telegram_sticker_file_ids: {
          SS: order.telegram_sticker_file_ids,
        },
        telegram_sticker_set_name: {
          S: order.telegram_sticker_set_name,
        },
        payment: {
          M: {
            method: {
              S: order.payment.method,
            },
          },
        },
        stickers_cost: {
          N: order.stickers_cost.toString(),
        },
        events: {
          M: {
            confirmed: {
              S: now,
            },
          },
        },
        created_at: {
          S: now,
        },
      },
    }),
  )
}
