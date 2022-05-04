import fs from 'fs'
import getRawBody from 'raw-body'
import { prepareImageForPrint, gm } from '../../image_magick'

const processImage = async (imagePostfix: string) => {
  // read image as stream
  const fileBuffer = await getRawBody(fs.createReadStream(`./input-${imagePostfix}.png`))

  // prepare image for printing
  const preparedImage = await prepareImageForPrint(fileBuffer)

  // save image to file
  gm(preparedImage).write(`./output-${imagePostfix}.png`, (error) => {
    if (error) {
      console.error(error)
    }
  })

  console.log(`✅ image successfully processed`)
}

;['1', '2', '3', '4', '5'].forEach((index) => {
  processImage(index)
})
