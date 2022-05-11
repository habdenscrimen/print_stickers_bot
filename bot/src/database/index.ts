import admin from 'firebase-admin'
import { StorageAdapter } from 'grammy'
import { Config } from '../config'

/* eslint-disable-next-line */
export interface Database {}

export type Handler<HandlerName extends keyof Database> = (
  database: admin.database.Database,
  args: Parameters<Database[HandlerName]>,
) => ReturnType<Database[HandlerName]>

export const newDatabase = (firebaseApp: admin.app.App): Database => {
  const db = admin.database(firebaseApp)

  return {}
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
