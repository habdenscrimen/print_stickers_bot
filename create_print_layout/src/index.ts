import { initFirebase } from './firebase'
import { getConfirmedOrderIDs } from './database'
import { getOrderFileBuffers, uploadPrintLayout } from './storage'
import { prepareImageForPrinting } from './image_magick'

const { db } = initFirebase()

const processImages = async () => {
  /* 
    TODO:
    1. Get orders from Database with 'confirmed' status.
    2. Get raw images from Storage for each order.
    3. Read each image as Buffer.
    4. Process every image using ImageMagick.
    5. Create print-ready layouts from the processed images.
    6. Save print-ready layouts to Storage.
    7. Update order status to 'print_ready' in Database.
  */

  // get confirmed order ids
  const confirmedOrderIDs = await getConfirmedOrderIDs(db)

  // get file streams for every order
  const processOrders = confirmedOrderIDs.map(async (orderID) => {
    const fileBuffers = await getOrderFileBuffers(orderID)

    // process every image
    const images = await Promise.all(fileBuffers.map(prepareImageForPrinting))

    // TODO: combine images into layout

    // upload print layout to storage
    await Promise.all(images.map((buffer) => uploadPrintLayout(buffer, orderID)))
  })

  await Promise.all(processOrders)
}

processImages()
