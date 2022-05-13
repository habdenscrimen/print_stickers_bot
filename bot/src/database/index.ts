import admin from 'firebase-admin'
import { StorageAdapter } from 'grammy'
import { Config } from '../config'
import { Order, User } from '../domain'
import { createOrder } from './create_order'
import { getUser } from './get_user'
import { updateUser } from './update_user'

export interface Database {
  GetUser: (userID: number) => Promise<User | undefined>
  UpdateUser: (userID: number, user: Partial<User>) => Promise<void>
  CreateOrder: (order: Order) => Promise<string>
}

export type Handler<HandlerName extends keyof Database> = (
  database: admin.database.Database,
  args: Parameters<Database[HandlerName]>,
) => ReturnType<Database[HandlerName]>

export const newDatabase = (firebaseApp: admin.app.App): Database => {
  const db = admin.database(firebaseApp)

  return {
    GetUser: (...args) => getUser(db, [...args]),
    UpdateUser: (...args) => updateUser(db, [...args]),
    CreateOrder: (...args) => createOrder(db, [...args]),
  }
}

export const newStorageAdapter = <T>(
  firebaseApp: admin.app.App,
  config: Config,
): StorageAdapter<T> => {
  const db = admin.database(firebaseApp)

  return {
    read: async (key: string) => {
      const snapshot = await db
        .ref(`${config.database.sessionStorageKey}/${key}`)
        .once('value')

      return snapshot.val() === null ? undefined : (snapshot.val() as T)
    },
    write: async (key: string, value: T) => {
      return db.ref(`${config.database.sessionStorageKey}/${key}`).set(value)
    },
    delete: async (key: string) => {
      return db.ref(`${config.database.sessionStorageKey}/${key}`).remove()
    },
  }
}
