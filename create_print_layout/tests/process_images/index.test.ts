import test from 'ava'
import fs from 'fs'
import files from '../../src/files'
import image from '../../src/image'

const outputDirectory = `${__dirname}/output`

test.before(() => {
  files.createTempFilesDirectory()
})

// test.after(() => {
//   // remove directory if exists
//   if (fs.existsSync(outputDirectory)) {
//     fs.rmSync(outputDirectory, { recursive: true })
//   }
// })

// TODO: write a real test for checking the output
test('should add image outline', async (t) => {
  // read fixtures as buffers
  const sourceImages = new Array(14)
    .fill(0)
    .map((_, index) => fs.readFileSync(`${__dirname}/input/input-${index + 1}.webp`))

  // process images
  const processedImages = await Promise.all(sourceImages.map(image.prepareForPrinting))

  // create a new temp files directory
  fs.mkdirSync(outputDirectory)

  // write processed images to output directory
  processedImages.forEach((image, index) => {
    fs.writeFileSync(`${outputDirectory}/${index + 1}.svg`, image, 'utf-8')
  })

  t.pass()
})
