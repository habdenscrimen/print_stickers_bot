import { getFirestore } from 'firebase-admin/firestore'
import { StorageAdapter } from 'grammy'
import admin from 'firebase-admin'
import { Config } from '../../config'

export const initFirebase = (config: Config) => {
  // init firebase app
  const app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: config.storage.bucket,
  })

  // ignore undefined values
  app.firestore().settings({ ignoreUndefinedProperties: true })

  const db = getFirestore()

  return {
    firebaseApp: app,
    firestore: db,
  }
}

export const newStorageAdapter = <T>(
  config: Config,
  db: admin.firestore.Firestore,
): StorageAdapter<T> => {
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
