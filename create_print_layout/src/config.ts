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
  outlineWidth: 4,
  // layouts size in mm
  layouts: {
    minWidthInMM: 10,
    maxWidthInMM: 300,
    minHeightInMM: 10,
    maxHeightInMM: 420,
  },
}

export type Config = typeof config
