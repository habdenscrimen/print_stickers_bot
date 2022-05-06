import test from 'ava'
import fs from 'fs'
import files from '../../../src/files'
import { imageService } from '../../../src/services'

const outputDirectory = `${__dirname}/output`

test.before(() => {
  files.createTempFilesDirectory()

  // remove directory if exists
  if (fs.existsSync(outputDirectory)) {
    fs.rmSync(outputDirectory, { recursive: true })
  }
})

test.after(() => {
  // remove directory if exists
  if (fs.existsSync(outputDirectory)) {
    fs.rmSync(outputDirectory, { recursive: true })
  }
})

// TODO: write a real test for checking the output
test.skip('should add image outline', async (t) => {
  // read fixtures as buffers
  const sourceImages = new Array(14)
    .fill(0)
    .map((_, index) =>
      fs.readFileSync(
        `${process.cwd()}/tests/fixtures/input_images_webp/${index + 1}.webp`,
      ),
    )

  // process images
  const processedImages = await Promise.all(
    sourceImages.map(imageService.prepareForPrinting),
  )

  // create a new temp files directory
  fs.mkdirSync(outputDirectory)

  // write processed images to output directory
  processedImages.forEach((image, index) => {
    fs.writeFileSync(`${outputDirectory}/${index + 1}.svg`, image, 'utf-8')
  })

  t.pass()
})
