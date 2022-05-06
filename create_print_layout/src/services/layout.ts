/* eslint no-await-in-loop: 0 */

import fs from 'fs'
import { getSizingInPX, mergeSVGs } from '../layout'
import { Config } from '../config'
import files from '../files'

/*
  TODO:
  1. Create a border for layout.
  2. Align every layout row to the left side instead of center.
*/

/** createPrintLayouts creates print layout(s) from SVG images. */
const createPrintLayouts = async (
  config: Config,
  images: Buffer[],
): Promise<Buffer[]> => {
  const { maxLayoutWidth, gap, avgStickerWidth } = getSizingInPX(config.layouts)

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

  console.log(`layoutPath: ${layoutPath}`)

  // delete temp files
  files.deleteFiles(pathsToDelete)

  return []
}

export const layoutService = {
  createPrintLayouts,
}
