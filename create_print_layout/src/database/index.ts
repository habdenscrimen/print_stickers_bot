import admin from 'firebase-admin'
import { OrderStatus } from '../domain'
import { getOrderIDsByStatus } from './get_order_ids_by_status'

export interface Database {
  GetOrderIDsByStatus: (statuses: OrderStatus[]) => Promise<string[]>
}

export type Handler<HandlerName extends keyof Database> = (
  database: admin.database.Database,
  args: Parameters<Database[HandlerName]>,
) => ReturnType<Database[HandlerName]>

export const newDatabase = (firebaseApp: admin.app.App): Database => {
  const db = admin.database(firebaseApp)

  return {
    GetOrderIDsByStatus: (args) => getOrderIDsByStatus(db, [args]),
  }
}
