import admin from 'firebase-admin'
import { Order, OrderStatus } from '../domain'
import { getOrderIDsByStatus } from './get_order_ids_by_status'
import { updateOrder } from './update_order'

export interface Database {
  GetOrderIDsByStatus: (statuses: OrderStatus[]) => Promise<string[]>
  UpdateOrder: (orderID: string, order: Partial<Order>) => Promise<void>
}

export type Handler<HandlerName extends keyof Database> = (
  database: admin.database.Database,
  args: Parameters<Database[HandlerName]>,
) => ReturnType<Database[HandlerName]>

export const newDatabase = (firebaseApp: admin.app.App): Database => {
  const db = admin.database(firebaseApp)

  return {
    GetOrderIDsByStatus: (...args) => getOrderIDsByStatus(db, [...args]),
    UpdateOrder: (...args) => updateOrder(db, [...args]),
  }
}
