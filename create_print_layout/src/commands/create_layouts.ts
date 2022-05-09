import getRawBody from 'raw-body'
import fs from 'fs'
import { Command } from '.'
import { Context } from '../context'
import { Services } from '../services'

export const createLayoutsCommand: Command<'CreateLayouts'> = async (
  context,
  services,
) => {
  const logger = context.logger.child({ name: 'createLayoutsCommand' })

  /*
    TODO:
    1. Prepare every image for printing and upload it to the storage.
    2. Create layouts from ready-to-print images and upload them to the storage.
    3. Update order status to 'layout_ready' and set layout_ids as IDs of the newly created layouts.
  */

  // get confirmed order ids
  const orderIDs = await context.db.GetOrderIDsByStatus(['confirmed'])
  logger.debug('got confirmed order ids', { orderIDs })

  // process and upload images for every order
  const processAndUploadImagesPromise = orderIDs.map(async (orderID) => {
    // get order files from storage
    const orderPath = `${context.config.storage.paths.rawImages}/${orderID}`
    const storageFiles = await context.storage.GetFiles(orderPath)
    logger.debug('got order files', { orderID })

    // get buffers for every file
    const filesPromise = storageFiles.map((file) => getRawBody(file.createReadStream()))
    const files = await Promise.all(filesPromise)
    logger.debug('got files buffers', { orderID })

    // prepare order images for printing
    const preparedImagesPromise = files.map((file) =>
      prepareFileForPrint(context, services, file),
    )
    const printReadyImages = await Promise.all(preparedImagesPromise)
    logger.debug('prepared images for printing', { orderID })

    // upload images to storage
    const uploadFilesPromise = printReadyImages.map((file, index) => {
      const path = `${context.config.storage.paths.printReadyImages}/${orderID}/${index}.svg`
      return context.storage.UploadFile(file, path)
    })
    await Promise.all(uploadFilesPromise)
    logger.debug('uploaded images to storage', { orderID })

    return printReadyImages
  })

  const [images] = await Promise.all(processAndUploadImagesPromise)
  logger.info('processed and uploaded images', { orderIDs })
}

// TODO: remove temp files
const prepareFileForPrint = async (
  context: Context,
  services: Services,
  file: Buffer,
): Promise<Buffer> => {
  const logger = context.logger.child({ name: 'prepareFileForPrint' })

  // create SVG outline
  const { filePath: outlineFilePath, originalHeight } =
    await services.Image.CreateSVGOutline(file)
  logger.debug('created svg outline', { outlineFilePath })

  // convert raster to SVG
  const svgFilePath = await services.Image.RasterToSVG(file)
  logger.debug('converted raster to svg', { svgFilePath })

  // merge SVG outline with SVG image
  const mergeMargin = originalHeight + context.config.image.outlineWidth
  const mergedFilePath = await services.Image.MergeSVGs(
    svgFilePath,
    outlineFilePath,
    mergeMargin,
  )
  logger.debug('merged svg outline with svg image', { mergedFilePath })

  // get merged file buffer
  const mergedFileBuffer = await getRawBody(fs.createReadStream(mergedFilePath))
  logger.debug('got merged file buffer')

  return mergedFileBuffer
}
