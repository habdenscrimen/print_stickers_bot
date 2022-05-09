/* eslint no-await-in-loop: 0 */

import fs from 'fs'
import { Database } from 'firebase-admin/database'
import getRawBody from 'raw-body'
import { nanoid } from 'nanoid'
import { getSizingInPX, mergeSVGs } from '../layout'
import { Config } from '../config'
import files from '../files'
import database from '../database'
import storage from '../storage'
import { LayoutSizing } from '../types'

/*
  TODO:
  1. Create a border for layout.
  2. Align every layout row to the left side instead of center.
*/

/** createPrintLayouts creates print layout(s) from SVG images. */
export const createPrintLayoutsCommand = async (
  config: Config,
  db: Database,
): Promise<void> => {
  const layoutSizing = getSizingInPX(config.layouts)

  // get images
  const { images, orderIDs } = await getPrintReadyImages(
    db,
    config.firebase.storage.paths.printReadyImages,
  )

  // check if there are print-ready images
  if (images.length === 0) {
    console.info('✅ no print-ready images found')
    return
  }

  // create print layouts
  const layouts = await createPrintLayouts(config, images, layoutSizing)

  // save layouts to storage
  const layoutIDs = await Promise.all(
    layouts.map(async (layout) => {
      const randomID = nanoid()

      await storage.uploadFileBuffer(
        layout,
        `${config.firebase.storage.paths.printReadyLayouts}/${randomID}.svg`,
      )

      return randomID
    }),
  )

  // set layout IDs in database for every order
  await Promise.all(
    orderIDs.map((orderID) =>
      database.updateOrder(db, orderID, {
        layouts_ids: layoutIDs,
        status: 'layout_ready',
      }),
    ),
  )

  // console.log(`layouts: ${layouts}`)
}

export const createPrintLayouts = async (
  config: Config,
  images: Buffer[],
  { maxLayoutWidth, avgStickerWidth, gap }: LayoutSizing,
): Promise<Buffer[]> => {
  // array of images (including temp ones) which will be deleted after the function ends
  const pathsToDelete: string[] = []

  // save images to temporary files
  const tempImagePaths = images.map((image) => {
    // create random file name
    const randomFilePath = files.generateTempFilePath('image-to-merge', 'svg')

    // mark file as to be deleted
    pathsToDelete.push(randomFilePath)

    // write SVG file without `width` and `height` attributes
    fs.writeFileSync(randomFilePath, image, 'utf-8')

    return randomFilePath
  })

  /* split images into chunks (rows) */
  const rows: string[][] = []
  const maxImagesInRow = Math.floor(maxLayoutWidth / avgStickerWidth)

  for (let i = 0; i < tempImagePaths.length; i += maxImagesInRow) {
    const row = tempImagePaths.slice(i, i + maxImagesInRow)
    rows.push(row)
  }

  /* merge images into rows */
  const layoutRowPaths: string[] = []

  for (let i = 0; i < rows.length; i += 1) {
    let mergedRowPath = rows[i][0]

    for (let j = 1; j < rows[i].length; j += 1) {
      mergedRowPath = await mergeSVGs(mergedRowPath, rows[i][j], gap, 'h', 'bla')

      // mark file as to be deleted
      pathsToDelete.push(mergedRowPath)
    }

    layoutRowPaths.push(mergedRowPath)
  }

  /* merge rows into layout */
  let layoutPath = layoutRowPaths[0]

  for (let i = 0; i < layoutRowPaths.length - 1; i += 1) {
    layoutPath = await mergeSVGs(layoutPath, layoutRowPaths[i + 1], gap, 'v', 'layout')
  }

  // mark file as to be deleted
  pathsToDelete.push(layoutPath)

  // add border to layout
  addLayoutBorder(layoutPath, config.layouts.border)

  // get file buffers
  const layoutBuffers = layoutRowPaths.map((path) => fs.readFileSync(path))

  // delete temp files
  await files.deleteFiles(pathsToDelete)

  console.info('✅ successfully created print layouts')
  return layoutBuffers
}

const addLayoutBorder = (layoutSVGPath: string, borderWidth: number): void => {
  // get SVG file as string
  const preparedImageContent = fs.readFileSync(layoutSVGPath, 'utf-8')

  // add border to SVG file
  const updatedImageContent = preparedImageContent.replace(
    /<svg xmlns/gim,
    `<svg style="border:${borderWidth}px solid white" xmlns`,
  )

  // write SVG file without `width` and `height` attributes
  fs.writeFileSync(layoutSVGPath, updatedImageContent, 'utf-8')
}

/* getPrintReadyImages returns print-ready images from storage. */
const getPrintReadyImages = async (
  db: Database,
  printReadyImagesStoragePath: string,
): Promise<{ orderIDs: string[]; images: Buffer[] }> => {
  try {
    // get confirmed order ids
    const confirmedOrderIDs = await database.getOrderIDsByStatus(db, [
      'confirmed',
      'print_ready',
    ])

    // count print-ready images (from confirmed orders)
    const orderFiles = await Promise.all(
      confirmedOrderIDs.map((orderID) =>
        storage.getFiles(`${printReadyImagesStoragePath}/${orderID}`),
      ),
    )

    // convert 2D array to 1D array
    const flatFiles = orderFiles.reduce((acc, cur) => acc.concat(cur), [])

    // get buffers for every file
    const images = await Promise.all(
      flatFiles.map((file) => getRawBody(file.createReadStream())),
    )

    console.info('✅ successfully got print-ready images')
    return { images, orderIDs: confirmedOrderIDs }
  } catch (error) {
    console.error(`❌ failed to get print ready images: ${error}`)
    throw error
  }
}
