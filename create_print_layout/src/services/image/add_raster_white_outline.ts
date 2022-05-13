import GraphicsMagick from 'gm'
import { promisify } from 'util'
import { ImageService } from '.'

const gm = GraphicsMagick.subClass({ imageMagick: true })

export const addRasterWhiteOutline: ImageService<'AddRasterWhiteOutline'> = async (
  context,
  fileServices,
  [file],
) => {
  const logger = context.logger.child({ name: 'addPNGWhiteOutline' })

  const GM = gm(file)

  GM.command('convert')
    .out('-bordercolor', 'none', '-border', '15')
    .out('(')
    .out('-clone', '0', '-alpha', 'off', '-fill', 'white', '-colorize', '100%')
    .out(')')
    .out('(')
    .out('-clone', '0', '-alpha', 'extract', '-morphology', 'edgeout', 'octagon:15')
    .out(')')
    .out('-compose', 'over', '-composite')

  const imageWithOutline = await promisify<Buffer>(GM.toBuffer.bind(GM))()

  logger.debug('created outline')
  return imageWithOutline
}
