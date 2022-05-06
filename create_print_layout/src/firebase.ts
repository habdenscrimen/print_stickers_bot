import admin from 'firebase-admin'
import { config } from './config'

const init = () => {
  // init firebase admin
  const app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: config.firebase.storage.bucket,
    databaseURL: config.firebase.databaseURL,
  })

  // init database
  const db = admin.database(app)

  console.debug('✅ firebase admin app and database initialized')
  return { app, db }
}

export default {
  init,
}
