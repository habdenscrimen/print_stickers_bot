import getRawBody from 'raw-body'
import { Command } from '.'

export const createLayoutsCommand: Command<'CreateLayouts'> = async (context) => {
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
    const files = await context.storage.GetFiles(orderPath)
    logger.debug('got order files', { orderID })

    // get buffers for every file
    const filesBuffersPromise = files.map((file) => getRawBody(file.createReadStream()))
    const filesBuffers = await Promise.all(filesBuffersPromise)
    logger.debug('got files buffers', { orderID })

    // TODO: implement
    // prepare order images for printing
    const printReadyImages = await Promise.all(filesBuffers.map(prepareImageForPrinting))
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
}

const prepareImageForPrinting = async (file: Buffer): Promise<Buffer> => {
  return file
}
