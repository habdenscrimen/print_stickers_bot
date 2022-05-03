// import * as functions from 'firebase-functions'
// import admin from 'firebase-admin'
// import { Database } from 'firebase-admin/database'
// import { App } from 'firebase-admin/app'
// import GraphicsMagick from 'gm'

import { initFirebase } from './firebase'
import { getConfirmedOrderIDs } from './database'

// // init gm
// const gm = GraphicsMagick.subClass({ imageMagick: true })

const { db } = initFirebase()

const processImages = async () => {
  /* 
    TODO:
    1. Get orders from Database with 'confirmed' status.
    2. Get raw images from Storage for each order.
    3. Read each image as Stream.
    4. Process every image using ImageMagick.
    5. Create print-ready layouts from the processed images.
    6. Save print-ready layouts to Storage.
    7. Update order status to 'print_ready' in Database.
  */

  const confirmedOrderIDs = await getConfirmedOrderIDs(db)
  console.log(confirmedOrderIDs)
}

processImages()

// export const getOrderFiles = async (app: App, db: Database, orderID: string) => {
//   const [orderFiles] = await admin.storage().bucket().getFiles({
//     prefix: orderID,
//   })

//   // console.log(orderFiles)

//   orderFiles.forEach((file) => {
//     // console.log(file.name)

//     const fileName = file.name.split('/').pop()

//     console.log(fileName)

//     const stream = file.createReadStream()
//     // // stream.

//     gm(stream).write(`./test_images/${fileName}`, (err) => {
//       if (err) {
//         console.log(`🚨 Error writing file: ${err}`)
//         return
//       }
//       console.log('done')
//     })
//   })

//   return orderFiles
// }
