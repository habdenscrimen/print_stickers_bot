import admin from 'firebase-admin'
import { config } from './config'

export const initFirebase = () => {
  // init firebase admin
  const app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: config.firebase.storageBucket,
    databaseURL: config.firebase.databaseURL,
  })

  // init database
  const db = admin.database(app)

  console.debug('firebase admin app and database initialized')
  return { app, db }
}
