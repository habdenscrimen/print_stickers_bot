import GraphicsMagick from 'gm'
import { promisify } from 'util'

// init ImageMagick
const gm = GraphicsMagick.subClass({ imageMagick: true })

/** saveBufferAsPNG saves buffer as PNG file. */
export const saveBufferAsPNG = async (
  buffer: Buffer,
  filePath: string,
): Promise<void> => {
  try {
    const GM = gm(buffer).command('convert')

    await promisify(GM.write.bind(GM))(filePath)

    console.info(`✅ successfully converted webp to png`)
  } catch (error) {
    console.error(`❌ failed to convert webp to png: ${error}`)
    throw error
  }
}
