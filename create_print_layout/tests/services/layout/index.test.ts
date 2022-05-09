import test from 'ava'
import fs from 'fs'
import { createPrintLayout } from '../../../src/commands'
import { config } from '../../../src/config'
import files from '../../../src/files'
import { getSizingInPX } from '../../../src/layout'

test.before(() => {
  files.createTempFilesDirectory()
})

test.only('should create layout from processed SVG images', async (t) => {
  t.timeout(100000)

  const layoutSizing = getSizingInPX(config.layouts)

  // read fixtures as buffers
  const processedImages = new Array(14)
    .fill(0)
    .map((_, index) =>
      fs.readFileSync(
        `${process.cwd()}/tests/fixtures/processed_images_svg/${index + 1}.svg`,
      ),
    )

  // cre ate layouts
  await createPrintLayout(config, processedImages, layoutSizing)

  t.pass()
})
