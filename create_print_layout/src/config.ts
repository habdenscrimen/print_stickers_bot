// import 'dotenv/config'
// import * as functions from 'firebase-functions'

// const firebaseConfig = functions.config()

export const config = {
  firebase: {
    functionsRegion: 'europe-central2',
    databaseURL: `https://print-stickers-default-rtdb.europe-west1.firebasedatabase.app/`,
    storage: {
      bucket: `gs://print-stickers.appspot.com`,
      paths: {
        rawImages: 'raw_images',
        printReadyImages: 'print_ready_images',
        printLayouts: 'print_layouts',
      },
    },
  },
  files: {
    tempFilesDirectory: `${process.cwd()}/temp_files`,
  },
}

export type Config = typeof config
