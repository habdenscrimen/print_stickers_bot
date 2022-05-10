import { exec } from 'child_process'
import GraphicsMagick from 'gm'
import { promisify } from 'util'
import { ImageService } from '.'

const gm = GraphicsMagick.subClass({ imageMagick: true })

export const rasterToSVG: ImageService<'RasterToSVG'> = async (
  context,
  fileServices,
  [file],
) => {
  const logger = context.logger.child({ name: 'rasterToSVG' })

  // save buffer as PNG
  const pngFilePath = fileServices.NewTempFileDirectory('png')
  const GM = gm(file).command('convert')
  await promisify(GM.write.bind(GM))(pngFilePath)
  logger.debug('saved file as png', { pngFilePath })

  // convert PNG to SVG using `inkscape`
  const svgFilePath = fileServices.NewTempFileDirectory('svg')
  const command = `inkscape --export-filename=${svgFilePath} ${pngFilePath}`

  const { stderr } = await promisify(exec)(command)
  if (stderr) {
    logger.error('failed to convert raster image to SVG', { stderr })
    throw new Error(stderr)
  }

  logger.debug('converted raster image to SVG', { svgFilePath })
  return svgFilePath
}
