import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { Order, OrderStatus } from '../domain'
import { getOrderIDsByStatus } from './get_order_ids_by_status'
import { updateOrder } from './update_order'

export interface Database {
  GetOrderIDsByStatus: (statuses: OrderStatus[]) => Promise<string[]>
  UpdateOrder: (orderID: string, order: Partial<Order>) => Promise<void>
}

export type Handler<HandlerName extends keyof Database> = (
  database: admin.firestore.Firestore,
  args: Parameters<Database[HandlerName]>,
) => ReturnType<Database[HandlerName]>

export const newDatabase = (): Database => {
  const db = getFirestore()

  // in development mode connect to local database (created by emulator)
  if (process.env.NODE_ENV !== 'production') {
    db.settings({
      host: 'localhost:8080',
      ssl: false,
    })
  }

  return {
    GetOrderIDsByStatus: (...args) => getOrderIDsByStatus(db, [...args]),
    UpdateOrder: (...args) => updateOrder(db, [...args]),
  }
}
