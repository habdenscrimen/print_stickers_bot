import { getFirestore } from 'firebase-admin/firestore'
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions'
import * as firebaseClient from 'firebase/app'
import { StorageAdapter } from 'grammy'
import admin from 'firebase-admin'
import { Config } from '../../config'

interface FirebaseApp {
  firebaseApp: admin.app.App
  firestore: admin.firestore.Firestore
  functions: Functions
}

export const initFirebase = (config: Config): FirebaseApp => {
  const adminApps = admin.apps
  const clientApps = firebaseClient.getApps()

  if (adminApps.length !== 0 && clientApps.length !== 0) {
    const db = getFirestore()

    const functions = getFunctions(clientApps[0], 'europe-central2')

    return {
      firebaseApp: adminApps[0]!,
      firestore: db,
      functions,
    }
  }

  // init firebase app
  const app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: config.storage.bucket,
  })

  // ignore undefined values
  app.firestore().settings({ ignoreUndefinedProperties: true })

  const db = getFirestore()

  // init firebase client to get access to functions
  const firebaseClientApp = firebaseClient.initializeApp(
    JSON.parse(config.firebase.clientConfig),
  )
  const functions = getFunctions(firebaseClientApp, 'europe-central2')

  // connect emulator if not in production
  if (config.env !== 'production') {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  }

  return {
    firebaseApp: app,
    firestore: db,
    functions,
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
