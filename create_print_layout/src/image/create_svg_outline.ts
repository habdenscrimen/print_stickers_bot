import { promisify } from 'util'
import GraphicsMagick from 'gm'
import fs from 'fs'
import files from '../files'

// init ImageMagick
const gm = GraphicsMagick.subClass({ imageMagick: true })

/** createSVGOutline creates an SVG outline for image. */
export const createSVGOutline = async (
  fileBuffer: Buffer,
): Promise<{
  filePath: string
  width: number
  height: number
}> => {
  try {
    // create GM instance with file buffer
    const GM = gm(fileBuffer)

    // get image size (width and height)
    const size = await promisify<{ width: number; height: number }>(GM.size.bind(GM))()

    // define sizing constants
    const outlineWidth = 4

    const resizeWidth = outlineWidth + size.width + outlineWidth
    const resizeHeight = outlineWidth + size.height + outlineWidth

    // create an image outline
    GM.command('convert')
      // resize image
      .out('-background', 'transparent')
      .out('-gravity', 'center')
      .out('-extent', `${resizeWidth}x${resizeHeight}`)

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

    // create random file name
    const randomFilePath = files.generateTempFilePath('outline', 'svg')

    // Write image to SVG file.
    // ImageMagick delegates working with SVG to `potrace`, which creates a smooth SVG outline required for printing.
    // `potrace` should be installed separately.
    await promisify<string>(GM.write.bind(GM))(randomFilePath)

    // get SVG file as string
    const tempOutlineData = fs.readFileSync(randomFilePath, 'utf-8')

    // remove `width` and `height` attributes from SVG string
    const dataWithUpdatedSize = tempOutlineData.replace(/width=".+" height=".+pt"/gim, '')

    // write SVG file without `width` and `height` attributes
    fs.writeFileSync(randomFilePath, dataWithUpdatedSize, 'utf-8')

    console.info(`✅ successfully created SVG outline file: ${randomFilePath}`)
    return {
      filePath: randomFilePath,
      width: size.width,
      height: size.height,
    }
  } catch (error) {
    console.error(`❌ failed to create SVG outline: ${error}`)
    throw error
  }
}
