import admin from 'firebase-admin'
import { Config } from './config'

export const initFirebase = (config: Config) => {
  const app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: config.storage.bucket,
  })

  app.firestore().settings({ ignoreUndefinedProperties: true })

  return {
    firebaseApp: app,
  }
}
