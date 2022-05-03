import GraphicsMagick from 'gm'
import internal from 'stream'
import { promisify } from 'util'

// init ImageMagick
const gm = GraphicsMagick.subClass({ imageMagick: true })

export const prepareImageForPrint = async (
  fileStream: internal.Readable,
): Promise<Buffer> => {
  console.info(`ℹ️  preparing image for print`)

  // process image
  const GM = gm(fileStream)

  // promisify `toBuffer` method
  const imageToBuffer = promisify<Buffer>(GM.toBuffer.bind(GM))

  // convert image to Buffer
  const buffer = await imageToBuffer()

  console.info(`ℹ️  successfully prepared image for print`)
  return buffer
}
