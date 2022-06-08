import GraphicsMagick from 'gm'
import { promisify } from 'util'
import fs from 'fs'
import { exec } from 'child_process'
import { ImageService } from '.'

const gm = GraphicsMagick.subClass({ imageMagick: true })

export const createSVGOutline: ImageService<'CreateSVGOutline'> = async (
  context,
  fileServices,
  [file],
) => {
  const logger = context.logger.child({ name: 'createSVGOutline' })

  const GM = gm(file)

  // get original image size
  const imageSize = await promisify<{ width: number; height: number }>(GM.size.bind(GM))()
  logger.debug('got image size', { width: imageSize.width, height: imageSize.height })

  // calculate outline size
  const { outlineWidth } = context.config.imageSizing
  const width = outlineWidth + imageSize.width + outlineWidth
  const height = outlineWidth + imageSize.height + outlineWidth
  logger.debug('calculated outline size', { width, height })

  // create an outline
  GM.command('convert')
    // resize image
    .out('-background', 'transparent')
    .out('-gravity', 'center')
    .out('-extent', `${width}x${height}`)
    // add an outline
    .out('(')
    .out('-clone', '0')
    .out('-fuzz', '75%')
    .out('-fill', 'none')
    .out('-draw', 'alpha 0,0 floodfill')
    .out('-alpha', 'extract')
    .out('-morphology', 'edgeout')
    .out(`disk:${outlineWidth}`, '-negate')
    // // remove background
    // //
    // .out('-transparent', 'white')
    // //
    .out(')')
    .out('-composite')

  // write outline to temp file
  const outlineFilePath = fileServices.NewTempFileDirectory('svg')
  await promisify<string>(GM.write.bind(GM))(outlineFilePath)
  logger.debug('created outline', { path: outlineFilePath })

  // update outline size
  const outlineContent = fs.readFileSync(outlineFilePath, 'utf-8')
  const outlineContentWithUpdatedSize = outlineContent.replace(
    /width=".+" height=".+pt"/gim,
    '',
  )
  fs.writeFileSync(outlineFilePath, outlineContentWithUpdatedSize, 'utf-8')
  logger.debug('updated outline size', { path: outlineFilePath })

  // replace outline with centerline (required for printing)
  const centerlinedOutlineFilePath = fileServices.NewTempFileDirectory('svg')
  const command = `autotrace --centerline --output-file=${centerlinedOutlineFilePath} ${outlineFilePath}`
  const { stderr } = await promisify(exec)(command)
  if (stderr) {
    logger.error('failed to merge SVG files', { stderr })
    throw new Error(stderr)
  }
  logger.debug('outline replaced with centerline', {
    centerlinedOutlineFilePath,
    command,
  })

  // update outline size
  const { heightInPX, widthInPX } = context.config.imageSizing
  const centerlinedOutlineContent = fs.readFileSync(centerlinedOutlineFilePath, 'utf-8')
  const centerlinedOutlineContentWithUpdatedSize = centerlinedOutlineContent.replace(
    /width=".+" height=".+"/gim,
    `viewBox="0 0 ${widthInPX} ${heightInPX}"`,
  )
  fs.writeFileSync(
    centerlinedOutlineFilePath,
    centerlinedOutlineContentWithUpdatedSize,
    'utf-8',
  )
  logger.debug('updated outline size', { path: centerlinedOutlineContentWithUpdatedSize })

  return {
    filePath: centerlinedOutlineFilePath,
    originalHeight: imageSize.height,
    originalWidth: imageSize.width,
  }
}
