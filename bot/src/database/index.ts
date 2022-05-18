import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { StorageAdapter } from 'grammy'
import { Order, OrderStatus, User } from '../domain'
import { createOrder } from './create_order'
import { getUser } from './get_user'
import { updateUser } from './update_user'
import { Config } from '../config'
import { addOrderEvent } from './add_order_event'
import { getActiveUserOrders } from './get_active_user_orders'
import { getUserByData } from './get_user_by_data'

export interface Database {
  GetUser: (userID: number) => Promise<User | undefined>
  GetUserByData: (data: Partial<User>) => Promise<User | undefined>
  UpdateUser: (userID: number, user: Partial<User>) => Promise<void>
  CreateOrder: (order: Omit<Order, 'created_at' | 'events'>) => Promise<string>
  AddOrderEvent: (orderID: string, eventType: OrderStatus) => Promise<void>
  GetActiveUserOrders: (userID: number) => Promise<Order[]>
}

export type Handler<HandlerName extends keyof Database> = (
  database: admin.firestore.Firestore,
  args: Parameters<Database[HandlerName]>,
) => ReturnType<Database[HandlerName]>

export const newDatabase = (): Database => {
  const db = getFirestore()

  return {
    GetUser: (...args) => getUser(db, [...args]),
    UpdateUser: (...args) => updateUser(db, [...args]),
    CreateOrder: (...args) => createOrder(db, [...args]),
    AddOrderEvent: (...args) => addOrderEvent(db, [...args]),
    GetActiveUserOrders: (...args) => getActiveUserOrders(db, [...args]),
    GetUserByData: (...args) => getUserByData(db, [...args]),
  }
}

export const newStorageAdapter = <T>(config: Config): StorageAdapter<T> => {
  const db = getFirestore()

  const collection = db.collection(config.database.sessionStorageKey)

  return {
    read: async (key: string) => {
      const snapshot = await collection.doc(key).get()
      return snapshot.data() as T | undefined
    },
    write: async (key: string, value: T) => {
      await collection.doc(key).set(value)
    },
    delete: async (key: string) => {
      await collection.doc(key).delete()
    },
  }
}
