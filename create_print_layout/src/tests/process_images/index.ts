// import fs from 'fs'
// import getRawBody from 'raw-body'
// import { promisify } from 'util'
// import { exec } from 'child_process'

// import { gm } from '../../_image_magick'
// import { uploadFileBuffer } from '../../storage'
// import { initFirebase } from '../../firebase'

// /** createSVGOutline creates an SVG outline for image. */
// const createSVGOutline = async (fileBuffer: Buffer): Promise<string> => {
//   try {
//     // define sizing constants
//     const outlineWidth = 4
//     const originalStickerSize = 512
//     const printingOffset = 5
//     const resizeWidth = originalStickerSize + printingOffset + outlineWidth

//     // create an image outline
//     const GM = gm(fileBuffer)
//       .command('convert')
//       // resize image
//       .out('-background', 'transparent')
//       .out('-gravity', 'center')
//       .out('-extent', `${resizeWidth}x${resizeWidth}`)

//       // add an outline
//       .out('(')
//       .out('-clone', '0')
//       .out('-fuzz', '75%')
//       .out('-fill', 'none')
//       .out('-draw', 'alpha 0,0 floodfill')
//       .out('-alpha', 'extract')
//       .out('-morphology', 'edgeout')

//       .out(`disk:${outlineWidth}`, '-negate')
//       // // remove background
//       // //
//       // .out('-transparent', 'white')
//       // //
//       .out(')')
//       .out('-composite')

//     // create random file name
//     const randomFilePath = `./temp-outline-${Math.random()}.svg`

//     // Write image to SVG file.
//     // ImageMagick delegates working with SVG to `potrace`, which creates a smooth SVG outline required for printing.
//     // `potrace` should be installed separately.
//     await promisify<string>(GM.write.bind(GM))(randomFilePath)

//     // get SVG file as string
//     const tempOutlineData = fs.readFileSync(randomFilePath, 'utf-8')

//     // remove `width` and `height` attributes from SVG string
//     const dataWithUpdatedSize = tempOutlineData.replace(
//       /width=".+" height=".+pt"/gim,
//       'width="516" height="516"',
//     )

//     // write SVG file without `width` and `height` attributes
//     fs.writeFileSync(randomFilePath, dataWithUpdatedSize, 'utf-8')

//     console.info(`ℹ️ successfully created SVG outline file: ${randomFilePath}`)
//     return randomFilePath
//   } catch (error) {
//     console.error(`❌ failed to create SVG outline: ${error}`)
//     throw error
//   }
// }

// /**
//  * convertRasterImageToVector convers raster image to SVG using `inkscape`.
//  * `inkscape` should be installed separately.
//  */
// const convertRasterImageToSVG = async (rasterImageFilePath: string) => {
//   try {
//     // create random file name
//     const randomFilePath = `./temp-image-${Math.random()}.svg`

//     // FIXME: `inkscape` opens confirmation popup (user should click "OK") and blocks the process.
//     // Consider using another tool for converting raster image to SVG.
//     await promisify(exec)(
//       `inkscape --export-filename=${randomFilePath} ${rasterImageFilePath}`,
//     )

//     console.info(`ℹ️ successfully converted rater image to SVG: ${randomFilePath}`)
//     return randomFilePath
//   } catch (error) {
//     console.error(`❌ failed to convert raster image to SVG: ${error}`)
//     throw error
//   }
// }

// /**
//  * mergeSVGs merges two SVG files into one.
//  * Used to merge SVG outline with SVG image.
//  */
// const mergeSVGs = async (
//   firstSVGPath: string,
//   secondSVGPath: string,
//   mergeMargin: number,
// ) => {
//   try {
//     // create random file name
//     const randomFilePath = `./prepared-image-${Math.random()}.svg`

//     // Merge SVG files using `svg_stack.py` Python3 script.
//     // Python3 should be installed.
//     await promisify(exec)(
//       `python3 ./merge_svgs.py --margin=-${mergeMargin} ${firstSVGPath} ${secondSVGPath} > ${randomFilePath}`,
//     )

//     console.info(`ℹ️ successfully merged two SVG fles: ${randomFilePath}`)
//     return randomFilePath
//   } catch (error) {
//     console.error(`❌ failed to merge SVGs: ${error}`)
//     throw error
//   }
// }

// /** prepareImageForPrinting prepares image for printing. */
// const prepareImageForPrinting = async (rasterImageFilePath: string): Promise<Buffer> => {
//   try {
//     // read image as buffer
//     const fileBuffer = await getRawBody(fs.createReadStream(rasterImageFilePath))

//     // create vector outline
//     // TODO: add white border to outline
//     const outlineFilePath = await createSVGOutline(fileBuffer)

//     // convert image to vector
//     const imageFilePath = await convertRasterImageToSVG(rasterImageFilePath)

//     // merge outline with image
//     // TODO: merge margin should be equal to the height of the image
//     const mergedFilePath = await mergeSVGs(imageFilePath, outlineFilePath, 512)

//     // create buffer from merged (ready-to-print) file
//     const printReadyFileBuffer = await getRawBody(fs.createReadStream(mergedFilePath))

//     // delete temp files
//     await deleteFiles([outlineFilePath, imageFilePath, mergedFilePath])

//     console.info(`ℹ️ successfully prepared image for printing`)
//     return printReadyFileBuffer
//   } catch (error) {
//     console.error(`❌ failed to prepare image for printing: ${error}`)
//     throw error
//   }
// }

// // init firebase
// initFirebase()

// const fakeOrderID = `${Math.random()}`

// Promise.all(
//   new Array(13).fill(0).map(async (_, index) => {
//     const printReadyImage = await prepareImageForPrinting(`./input-${index + 1}.png`)

//     await uploadFileBuffer(
//       printReadyImage,
//       `print_ready_images/${fakeOrderID}/${index}.svg`,
//     )
//   }),
// )
