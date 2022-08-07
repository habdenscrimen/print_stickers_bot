import getRawBody from 'raw-body'
// import { nanoid } from 'nanoid'
import fs from 'fs'
import { Services } from '../services'
import { Context } from '../context'
import { Command } from '.'

// TODO: add error handling
export const createLayoutsCommand: Command<'CreateLayouts'> = async (
  context,
  services,
) => {
  const logger = context.logger.child({ name: 'createLayoutsCommand' })

  // // get confirmed order ids
  // const orderIDs = await context.db.GetOrderIDsByStatus(['confirmed'])
  // logger.debug('got confirmed order ids', { orderIDs })

  // if (orderIDs.length === 0) {
  //   logger.info('✅ no confirmed orders found')
  //   return
  // }

  // // process and upload images for every order
  // const processAndUploadImagesPromise = orderIDs.map(async (orderID) => {
  // // get order file ids
  // const order = await context.db.GetOrder(orderID)
  // const orderTelegramFileIDs = order.telegram_sticker_file_ids
  // logger.debug('got order telegram file ids', { orderID, orderTelegramFileIDs })

  const filePaths = [
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_2005',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1793',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1792',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1791',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1795',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1794',
    //
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1930',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1939',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1934',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1937',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1938',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1940',
    'https://api.telegram.org/file/bot5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc/stickers/file_1941',
  ]

  // get order files from telegram
  const telegramFilesPromise = filePaths.map((filePath) =>
    services.Telegram.GetFileBuffer(filePath),
  )
  const files = await Promise.all(telegramFilesPromise)
  // logger.debug('got order files', { orderID })

  // prepare order images for printing
  const preparedImagesPromise = files.map((file) =>
    prepareFileForPrint(context, services, file),
  )
  const printReadyImages = await Promise.all(preparedImagesPromise)
  // logger.debug('prepared images for printing', { orderID })

  // // upload images to storage
  // const uploadFilesPromise = printReadyImages.map(({ file }, index) => {
  //   const path = `${context.config.storage.paths.printReadyImages}/${orderID}/${index}.svg`
  //   return context.storage.UploadFile(file, path)
  // })
  // await Promise.all(uploadFilesPromise)
  // logger.debug('uploaded images to storage', { orderID })

  // return printReadyImages
  // })

  // const res = await Promise.all(processAndUploadImagesPromise)
  // logger.info('processed and uploaded images', { orderIDs })

  // create layouts
  const imagePaths = printReadyImages.flat().map(({ filePath }) => filePath)
  const layouts = await createLayouts(context, services, imagePaths)
  logger.info('created layouts', { layouts: layouts.filePaths })

  // save current date to constant to use it for saving layouts locally and in storage
  const now = new Date()

  // move layouts to local layouts directory
  const randomLayoutsDirectory = `${context.config.localFiles.layoutsDirectory}/${now}`
  services.File.MoveFiles(layouts.filePaths, randomLayoutsDirectory)
  logger.info('moved layouts to local directory')

  // // upload layouts to storage
  // const uploadLayoutsPromise = layouts.files.map(async (file) => {
  //   const layoutID = nanoid()

  //   const { printReadyLayouts } = context.config.storage.paths
  //   const path = `${printReadyLayouts}/${now}/${layoutID}.svg`

  //   await context.storage.UploadFile(file, path)
  //   return layoutID
  // })
  // const layoutIDs = await Promise.all(uploadLayoutsPromise)
  // logger.info('uploaded layouts to storage', { layoutIDs })

  // // update orders in database
  // const updateOrdersPromise = orderIDs.map(async (orderID) => {
  //   // get order events
  //   const { events } = await context.db.GetOrder(orderID)

  //   // add `layout_ready` event to order
  //   await context.db.UpdateOrder(orderID, {
  //     layouts_ids: layoutIDs,
  //     status: 'layout_ready',
  //     events: { ...events, layout_ready: new Date().toISOString() },
  //   })
  // })
  // await Promise.all(updateOrdersPromise)
  // logger.info('updated orders in database', { orderIDs })

  // delete temp files
  services.File.DeleteTempFileDirectory()
}

export const prepareFileForPrint = async (
  context: Context,
  services: Services,
  file: Buffer,
): Promise<{ file: Buffer; filePath: string }> => {
  const logger = context.logger.child({ name: 'prepareFileForPrint' })

  // add raster white outline
  const rasterWithWhiteOutline = await services.Image.AddRasterWhiteOutline(file)
  logger.debug('added raster white outline')

  // create SVG outline
  const { filePath: outlineFilePath } = await services.Image.CreateSVGOutline(
    rasterWithWhiteOutline,
  )
  logger.debug('created svg outline', { outlineFilePath })

  // convert raster to SVG
  const svgFilePath = await services.Image.RasterToSVG(rasterWithWhiteOutline)
  logger.debug('converted raster to svg', { svgFilePath })

  const mergedFilePath = await services.Image.MergeSVGs(svgFilePath, outlineFilePath)
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
  logger.debug('added border to layouts')

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
