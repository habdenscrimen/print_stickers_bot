import admin from 'firebase-admin'
import { config } from './config'

// initFirebaseApp initializes firebase app
export const initFirebaseApp = async () => {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: config.firebaseStorageBucket,
  })

  console.debug('firebase app initialized')
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
