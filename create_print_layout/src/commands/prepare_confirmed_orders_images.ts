import getRawBody from 'raw-body'
import fs from 'fs'
import { Database } from 'firebase-admin/database'
import { createSVGOutline, mergeSVGs, rasterImageToSVG, saveBufferAsPNG } from '../image'

import database from '../database'
import { config, Config } from '../config'
import storage from '../storage'
import files from '../files'

/**
 * processConfirmedOrdersImages processes confirmed orders:
 * prepares images for printing and creates print-ready layouts from them.
 */
export const processConfirmedOrdersImages = async (
  config: Config,
  db: Database,
): Promise<void> => {
  // get confirmed order ids
  const confirmedOrderIDs = await database.getOrderIDsByStatus(db, ['confirmed'])

  // process every order
  await Promise.all(
    confirmedOrderIDs.map(async (orderID) => {
      // prepare order images for printing
      await processOrderImages(config, orderID)

      // update order status in database
      await database.updateOrder(db, orderID, { status: 'print_ready' })
    }),
  )
}

/** processOrderImages processes order by order id. */
const processOrderImages = async (config: Config, orderID: string): Promise<void> => {
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
      orderFileBuffers.map(prepareImageForPrinting),
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
  } catch (error) {
    console.error(`❌ failed to process order ${orderID}: ${error}`)
  }
}

// TODO: remove `export` when testing is done (used in tests).
/**
 * prepareImageForPrinting prepares image for printing:
 * - creates vector outline
 * - converts raster image to vector
 * - merges vector outline with vector image
 * - creates and returns buffer from merged (ready-to-print) file (image + outline)
 */
export const prepareImageForPrinting = async (buffer: Buffer): Promise<Buffer> => {
  try {
    // create vector outline
    // TODO: add white border to outline
    const { filePath: outlineFilePath, height } = await createSVGOutline(buffer)

    // temporary save raster image to disk for converting it to SVG
    const rasterImageFilePath = files.generateTempFilePath('raster-image', 'png')
    await saveBufferAsPNG(buffer, rasterImageFilePath)

    // convert image to vector
    const imageFilePath = await rasterImageToSVG(rasterImageFilePath)

    // merge outline with image
    // TODO: merge margin should be equal to the height of the image
    const mergedFilePath = await mergeSVGs(
      imageFilePath,
      outlineFilePath,
      height + config.outlineWidth,
    )

    // create buffer from merged (ready-to-print) file
    const printReadyFileBuffer = await getRawBody(fs.createReadStream(mergedFilePath))

    // delete temp files
    await files.deleteFiles([
      outlineFilePath,
      imageFilePath,
      mergedFilePath,
      rasterImageFilePath,
    ])

    console.info(`✅ successfully prepared image for printing`)
    return printReadyFileBuffer
  } catch (error) {
    console.error(`❌ failed to prepare image for printing: ${error}`)
    throw error
  }
}
