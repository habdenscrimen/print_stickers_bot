import { Database } from 'firebase-admin/database'
import getRawBody from 'raw-body'

import { imageService, layoutService } from './services'
import database from './database'
import { config, Config } from './config'
import storage from './storage'
import firebase from './firebase'
import files from './files'

const { db } = firebase.init()

// create temp files directory
files.createTempFilesDirectory()

/** processOrder processes order by order id. */
const processOrder = async (config: Config, orderID: string) => {
  try {
    // get order files from storage
    const orderFiles = await storage.getFiles(
      `${config.firebase.storage.paths.rawImages}/${orderID}`,
    )

    // get buffers for every file
    const orderFileBuffers = await Promise.all(
      orderFiles.map((file) => getRawBody(file.createReadStream())),
    )

    // prepare images for printing
    const printReadyImages = await Promise.all(
      orderFileBuffers.map(imageService.prepareForPrinting),
    )

    // upload print ready images to storage
    await Promise.all(
      printReadyImages.map((buffer, index) =>
        storage.uploadFileBuffer(
          buffer,
          `${config.firebase.storage.paths.printReadyImages}/${orderID}/${index}.svg`,
        ),
      ),
    )

    // create print layouts from order images
    const orderLayouts = await layoutService.createPrintLayouts(config, printReadyImages)

    // TODO: upload print layouts to storage
  } catch (error) {
    console.error(`❌ failed to process order ${orderID}: ${error}`)
  }
}

/**
 * processConfirmedOrders processes confirmed orders:
 * prepares images for printing and creates print-ready layouts from them.
 */
const processConfirmedOrders = async (config: Config, db: Database) => {
  // get confirmed order ids
  const confirmedOrderIDs = await database.getConfirmedOrderIDs(db)

  // process every order
  await Promise.all(confirmedOrderIDs.map((orderID) => processOrder(config, orderID)))

  console.info('✅ ✅ ✅ successfully processed confirmed orders')
}

processConfirmedOrders(config, db)
