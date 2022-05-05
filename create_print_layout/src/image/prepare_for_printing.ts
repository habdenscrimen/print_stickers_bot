import getRawBody from 'raw-body'
import fs from 'fs'
import { createSVGOutline } from './create_svg_outline'
import { rasterImageToSVG } from './raster_to_svg'
import { mergeSVGs } from './merge_svgs'
import { saveBufferAsPNG } from './buffer_to_png'
import files from '../files'

/**
 * prepareForPrinting prepares image for printing:
 * - creates vector outline
 * - converts raster image to vector
 * - merges vector outline with vector image
 * - creates and returns buffer from merged (ready-to-print) file (image + outline)
 */
export const prepareForPrinting = async (buffer: Buffer): Promise<Buffer> => {
  try {
    // create vector outline
    // TODO: add white border to outline
    const outlineFilePath = await createSVGOutline(buffer)

    // temporary save raster image to disk for converting it to SVG
    const rasterImageFilePath = files.generateTempFilePath('raster-image', 'png')
    await saveBufferAsPNG(buffer, rasterImageFilePath)

    // convert image to vector
    const imageFilePath = await rasterImageToSVG(rasterImageFilePath)

    // merge outline with image
    // TODO: merge margin should be equal to the height of the image
    const mergedFilePath = await mergeSVGs(imageFilePath, outlineFilePath, 512)

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
