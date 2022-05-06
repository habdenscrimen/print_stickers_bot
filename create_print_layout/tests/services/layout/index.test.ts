import test from 'ava'
import fs from 'fs'
import { layoutService } from '../../../src/services'
import { config } from '../../../src/config'

test.only('should create layout from processed SVG images', async (t) => {
  // read fixtures as buffers
  const processedImages = new Array(14)
    .fill(0)
    .map((_, index) =>
      fs.readFileSync(
        `${process.cwd()}/tests/fixtures/processed_images_svg/${index + 1}.svg`,
      ),
    )

  // create layouts
  await layoutService.createPrintLayouts(config, processedImages)

  t.pass()
})
