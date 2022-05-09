import admin from 'firebase-admin'
import { Config } from './config'

export const initFirebase = (config: Config) => {
  const app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: config.storage.bucket,
    databaseURL: config.database.url,
  })

  const db = admin.database(app)

  return {
    app,
    db,
    storage: admin.storage(),
  }
}
