import test from 'ava'
import fs from 'fs'
import { createPrintLayouts } from '../../../src/commands'
import { config } from '../../../src/config'
import files from '../../../src/files'

test.before(() => {
  files.createTempFilesDirectory()
})

test('should create layout from processed SVG images', async (t) => {
  t.timeout(100000)

  // read fixtures as buffers
  const processedImages = new Array(14)
    .fill(0)
    .map((_, index) =>
      fs.readFileSync(
        `${process.cwd()}/tests/fixtures/processed_images_svg/${index + 1}.svg`,
      ),
    )

  // create layouts
  await createPrintLayouts(config, processedImages)

  t.pass()
})
