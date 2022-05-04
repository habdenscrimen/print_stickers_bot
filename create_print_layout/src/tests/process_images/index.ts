import fs from 'fs'
import getRawBody from 'raw-body'
import { prepareImageForPrinting, gm } from '../../image_magick'

const processImage = async (imagePostfix: string) => {
  // read image as stream
  const fileBuffer = await getRawBody(fs.createReadStream(`./input-${imagePostfix}.png`))

  // prepare image for printing
  const preparedImage = await prepareImageForPrinting(fileBuffer)

  // save image to file
  gm(preparedImage).write(`./output-${imagePostfix}.png`, (error) => {
    if (error) {
      console.error(error)
    }
  })

  console.log(`✅ image successfully processed`)
}

// new Array(14).fill(0).forEach((_, index) => {
//   processImage(`${index + 1}`)
// })

processImage(`7`)
