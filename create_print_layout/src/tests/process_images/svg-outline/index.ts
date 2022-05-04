import fs from 'fs'
import getRawBody from 'raw-body'
import { promisify } from 'util'
import { exec } from 'child_process'

import { gm } from '../../../image_magick'

/** createSVGOutline creates an SVG outline for image. */
const createSVGOutline = async (fileBuffer: Buffer): Promise<string> => {
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
    const randomFilePath = `./temp-outline-${Math.random()}.svg`

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

    console.info(`ℹ️ successfully created SVG outline file: ${randomFilePath}`)
    return randomFilePath
  } catch (error) {
    console.error(`❌ failed to create SVG outline: ${error}`)
    throw error
  }
}

/**
 * convertRasterImageToVector convers raster image to SVG using `inkscape`.
 * `inkscape` should be installed separately.
 */
const convertRasterImageToSVG = async (rasterImageFilePath: string) => {
  try {
    // create random file name
    const randomFilePath = `./temp-image-${Math.random()}.svg`

    // FIXME: `inkscape` opens confirmation popup (user should click "OK") and blocks the process.
    // Consider using another tool for converting raster image to SVG.
    await promisify(exec)(
      `inkscape --export-filename=${randomFilePath} ${rasterImageFilePath}`,
    )

    console.info(`ℹ️ successfully converted rater image to SVG: ${randomFilePath}`)
    return randomFilePath
  } catch (error) {
    console.error(`❌ failed to convert raster image to SVG: ${error}`)
    throw error
  }
}

/**
 * mergeSVGs merges two SVG files into one.
 * Used to merge SVG outline with SVG image.
 */
const mergeSVGs = async (
  firstSVGPath: string,
  secondSVGPath: string,
  mergeMargin: number,
) => {
  try {
    // create random file name
    const randomFilePath = `./prepared-image-${Math.random()}.svg`

    console.log(
      `python3 ./svg_stack.py --margin=-${mergeMargin} ${firstSVGPath} ${secondSVGPath} > ${randomFilePath}`,
    )

    // Merge SVG files using `svg_stack.py` Python3 script.
    // Python3 should be installed.
    await promisify(exec)(
      `python3 ./merge_svgs.py --margin=-${mergeMargin} ${firstSVGPath} ${secondSVGPath} > ${randomFilePath}`,
    )

    console.info(`ℹ️ successfully merged two SVG fles: ${randomFilePath}`)
  } catch (error) {
    console.error(`❌ failed to merge SVGs: ${error}`)
    throw error
  }
}

/** deleteFiles deletes files by file path. */
const deleteFiles = async (filePaths: string[]) => {
  try {
    await Promise.all(filePaths.map((filePath) => promisify(fs.unlink)(filePath)))

    console.info(`ℹ️ successfully deleted files: ${filePaths.join(', ')}`)
  } catch (error) {
    console.error(`❌ failed to delete files: ${error}`)
    throw error
  }
}

const process = async () => {
  // raster image file path
  const rasterImageFilePath = `./input.png`

  // read image as stream
  const fileBuffer = await getRawBody(fs.createReadStream(rasterImageFilePath))

  // create vector outline
  const outlineFilePath = await createSVGOutline(fileBuffer)

  // convert image to vector
  const imageFilePath = await convertRasterImageToSVG(rasterImageFilePath)

  // merge outline with image
  const mergedFilePath = await mergeSVGs(imageFilePath, outlineFilePath, 512)

  // delete outline and image temp files
  await deleteFiles([outlineFilePath, imageFilePath])
}

process()
