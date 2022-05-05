import { promisify } from 'util'
import GraphicsMagick from 'gm'
import fs from 'fs'
import files from '../files'

// init ImageMagick
const gm = GraphicsMagick.subClass({ imageMagick: true })

/** createSVGOutline creates an SVG outline for image. */
export const createSVGOutline = async (fileBuffer: Buffer): Promise<string> => {
  try {
    // define sizing constants
    const outlineWidth = 4
    const originalStickerSize = 512
    const printingOffset = 5
    const resizeWidth = originalStickerSize + printingOffset + outlineWidth

    // create an image outline
    const GM = gm(fileBuffer)
      .command('convert')
      // resize image
      .out('-background', 'transparent')
      .out('-gravity', 'center')
      .out('-extent', `${resizeWidth}x${resizeWidth}`)

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
    const dataWithUpdatedSize = tempOutlineData.replace(
      /width=".+" height=".+pt"/gim,
      'width="516" height="516"',
    )

    // write SVG file without `width` and `height` attributes
    fs.writeFileSync(randomFilePath, dataWithUpdatedSize, 'utf-8')

    console.info(`✅ successfully created SVG outline file: ${randomFilePath}`)
    return randomFilePath
  } catch (error) {
    console.error(`❌ failed to create SVG outline: ${error}`)
    throw error
  }
}
