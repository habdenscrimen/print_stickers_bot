import GraphicsMagick from 'gm'
import { promisify } from 'util'

// init ImageMagick
export const gm = GraphicsMagick.subClass({ imageMagick: true })

/** prepareImageForPrint prepares image for printing */
export const prepareImageForPrinting = async (fileBuffer: Buffer): Promise<Buffer> => {
  console.info(`ℹ️  preparing image for print`)

  // create GM instance from file buffer
  let GM = gm(fileBuffer)

  // check if image is transparent
  const isTransparent = await checkIfTransparent(GM)

  // prepare image for printing
  if (isTransparent) {
    GM = prepareTransparentImageForPrinting(GM)
  } else {
    GM = prepareOpaqueImageForPrinting(GM)
  }

  // convert image to Buffer
  const buffer = await promisify<Buffer>(GM.toBuffer.bind(GM))()

  console.info(`ℹ️  successfully prepared image for printing`)
  return buffer
}

const checkIfTransparent = async (GM: GraphicsMagick.State) => {
  const identify = promisify(GM.identify.bind(GM))

  const value = (await identify()) as {
    'Channel statistics': {
      Alpha:
        | {
            min: string
            max: string
          }
        | undefined
    }
  }

  return (
    value['Channel statistics'].Alpha &&
    value['Channel statistics'].Alpha.min !== value['Channel statistics'].Alpha.max
  )
}

/** processTransparentImage prepares transparent image for printing */
const prepareTransparentImageForPrinting = (
  GM: GraphicsMagick.State,
): GraphicsMagick.State => {
  // define sizing constants
  const outlineWidth = 4
  const originalStickerSize = 512
  const printingOffset = 40
  const resizeWidth = originalStickerSize + printingOffset + outlineWidth

  // const gm = GM.command('convert')
  //   // .out('-resize', `${originalStickerSize}x${originalStickerSize}`)
  //   // resize image
  //   .out('-background', 'transparent')
  //   .out('-gravity', 'center')
  //   .out('-extent', `${resizeWidth}x${resizeWidth}`)

  //   // add an outline
  //   .out('(')
  //   .out('-clone', '0')
  //   .out('-fuzz', '75%')
  //   .out('-fill', 'none')
  //   .out('-draw', 'alpha 0,0 floodfill')
  //   .out('-alpha', 'extract')
  //   .out('-morphology', 'edgeout')

  //   .out(`disk:${outlineWidth}`, '-negate')
  //   // // remove background
  //   // //
  //   // .out('-transparent', 'white')
  //   // //
  //   // // add blur (smoothing)
  //   // //
  //   // .out('-blur', '0x0.5', '-level', '50x100%')
  //   // //
  //   .out(')')

  //   // compose images (image + outline) into one
  //   .out('-compose', 'multiply')
  //   .out('-composite')
  // // .write('./lol.png', (err) => {
  // //   if (err) {
  // //     console.error(`❌  error while preparing image for print`, err)
  // //   }
  // // })

  const gm = GM.command('convert')
    // .out('-resize', `${originalStickerSize}x${originalStickerSize}`)
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
    // // add blur (smoothing)
    // //
    // .out('-blur', '0x0.5', '-level', '50x100%')
    // //
    .out(')')

    // compose images (image + outline) into one
    // .out('-compose', 'multiply')
    // .background('transparent')
    .out('-composite')
  // .write('./lol.png', (err) => {
  //   if (err) {
  //     console.error(`❌  error while preparing image for print`, err)
  //   }
  // })

  return gm
}

/** prepareOpaqueImageForPrinting prepares opaque image for printing */
const prepareOpaqueImageForPrinting = (
  GM: GraphicsMagick.State,
): GraphicsMagick.State => {
  // define sizing constants
  const originalStickerSize = 512
  const printingOffset = 40
  const resizeWidth = originalStickerSize + printingOffset

  const gm = GM.command('convert')
    // .out('-resize', `${originalStickerSize}x${originalStickerSize}`)
    // resize image
    .out('-background', 'transparent')
    .out('-gravity', 'center')
    .out('-extent', `${resizeWidth}x${resizeWidth}`)

  return gm
}
