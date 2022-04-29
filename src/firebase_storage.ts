import admin from 'firebase-admin'
// import firebaseApp from 'firebase/app'
// import firebaseDatabase from 'firebase/database'
import { config } from './config'

// initFirebaseApp initializes firebase admin (used for firebase storage and functions)
export const initFirebaseAdmin = () => {
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

// saveFileToStorage saves a file buffer to firebase storage
export const saveFileToStorage = async (path: string, buffer: Buffer) => {
  try {
    console.debug('saving image to storage')

    // save file buffer to storage
    await admin.storage().bucket().file(path).save(buffer)

    console.debug('successfully saved file to storage')
  } catch (error) {
    console.error(`failed to save file to storage: ${error}`)
  }
}

/** deleteFileFromStorage deletes a file from firebase storage */
export const deleteFileFromStorage = async (path: string) => {
  try {
    console.debug('deleting file from storage')

    // delete file from storage
    await admin.storage().bucket().deleteFiles({ prefix: path })

    console.debug('successfully deleted file from storage')
  } catch (error) {
    console.error(`failed to delete file from storage: ${error}`)
  }
}
