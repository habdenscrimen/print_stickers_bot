// import 'dotenv/config'
// import * as functions from 'firebase-functions'

// const firebaseConfig = functions.config()

export const config = {
  firebase: {
    functionsRegion: 'europe-central2',
    storageBucket: `gs://print-stickers.appspot.com`,
    databaseURL: `https://print-stickers-default-rtdb.europe-west1.firebasedatabase.app/`,
  },
}

export type Config = typeof config
