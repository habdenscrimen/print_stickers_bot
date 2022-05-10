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
    const uploadFilesPromise = printReadyImages.map(({ file }, index) => {
      const path = `${context.config.storage.paths.printReadyImages}/${orderID}/${index}.svg`
      return context.storage.UploadFile(file, path)
    })
    await Promise.all(uploadFilesPromise)
    logger.debug('uploaded images to storage', { orderID })

    return printReadyImages
  })

  const [images] = await Promise.all(processAndUploadImagesPromise)
  logger.info('processed and uploaded images', { orderIDs })

  // create layouts
  const imagePaths = images.map(({ filePath }) => filePath)
  const layouts = await createLayouts(context, services, imagePaths)
  logger.info('created layouts', { layouts: layouts.filePaths })
}

// TODO: remove temp files
const prepareFileForPrint = async (
  context: Context,
  services: Services,
  file: Buffer,
): Promise<{ file: Buffer; filePath: string }> => {
  const logger = context.logger.child({ name: 'prepareFileForPrint' })

  // create SVG outline
  const { filePath: outlineFilePath, originalHeight } =
    await services.Image.CreateSVGOutline(file)
  logger.debug('created svg outline', { outlineFilePath })

  // convert raster to SVG
  const svgFilePath = await services.Image.RasterToSVG(file)
  logger.debug('converted raster to svg', { svgFilePath })

  // merge SVG outline with SVG image
  const mergeMargin = originalHeight + context.config.imageSizing.outlineWidth
  const mergedFilePath = await services.Image.MergeSVGs(
    svgFilePath,
    outlineFilePath,
    mergeMargin,
  )
  logger.debug('merged svg outline with svg image', { mergedFilePath })

  // get merged file buffer
  const mergedFileBuffer = await getRawBody(fs.createReadStream(mergedFilePath))
  logger.debug('got merged file buffer')

  return {
    file: mergedFileBuffer,
    filePath: mergedFilePath,
  }
}

export const createLayouts = async (
  context: Context,
  services: Services,
  imagePaths: string[],
): Promise<{ files: Buffer[]; filePaths: string[] }> => {
  const logger = context.logger.child({ name: 'createLayouts' })

  // get sizing in px
  const sizing = services.Layout.GetSizingInPX()
  logger.debug('got sizing in px', { sizing })

  // split layout images into chunks
  const layoutImages = chunkArray3D(
    imagePaths,
    sizing.maxImagesPerRow,
    sizing.maxImagesPerColumn,
  )
  logger.debug('chunked layout images', { layoutImages })

  // merge images into layouts
  const layoutPaths: string[] = []

  for (let i = 0; i < layoutImages.length; i += 1) {
    let layoutRows = ''

    // merge rows into layout
    for (let j = 0; j < layoutImages[i].length; j += 1) {
      let mergedRow = layoutImages[i][j][0]

      // merge row items into row
      for (let k = 1; k < layoutImages[i][j].length; k += 1) {
        mergedRow = await services.Layout.MergeSVGs(
          mergedRow,
          layoutImages[i][j][k],
          sizing.gap,
          'h',
        )
      }

      layoutRows = await services.Layout.MergeSVGs(layoutRows, mergedRow, sizing.gap, 'v')
    }

    layoutPaths.push(layoutRows)
  }
  logger.debug('merged layout images', { layoutPaths })

  // add border to layouts
  layoutPaths.forEach((layoutPath) => {
    services.Layout.AddSVGBorder(layoutPath)
  })

  // get buffer for every layout
  const filesPromise = layoutPaths.map((filePath) =>
    getRawBody(fs.createReadStream(filePath)),
  )
  const files = await Promise.all(filesPromise)
  logger.debug('got files buffers')

  return {
    files,
    filePaths: layoutPaths,
  }
}

export const chunkArray3D = <T>(arr: T[], width2D: number, height2D: number): T[][][] => {
  // split array into 2D chunks
  const chunks2D: T[][] = []

  while (arr.length) {
    chunks2D.push(arr.splice(0, width2D * height2D))
  }

  // split 2D chunks into 2D chunks and merge them into 3D chunks
  const result: T[][][] = []

  for (let i = 0; i < chunks2D.length; i += 1) {
    const chunk3D: T[][] = []

    while (chunks2D[i].length) {
      chunk3D.push(chunks2D[i].splice(0, width2D))
    }

    result.push(chunk3D)
  }

  return result
}
