import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import files from '../files'

/**
 * mergeSVGs merges two SVG files into one.
 * Used to merge SVG outline with SVG image.
 */
export const mergeSVGs = async (
  firstSVGPath: string,
  secondSVGPath: string,
  mergeMargin: number,
): Promise<string> => {
  try {
    // create random file name
    const randomFilePath = files.generateTempFilePath('prepared-image', 'svg')

    // Merge SVG files using `svg_stack.py` Python3 script.
    // Python3 should be installed.
    const command = `python3 ${__dirname}/merge_svgs.py --margin=-${mergeMargin} ${firstSVGPath} ${secondSVGPath} > ${randomFilePath}`

    const { stderr } = await promisify(exec)(command)
    if (stderr) {
      console.error(`❌ failed to merge SVG files: ${stderr}`)
      throw new Error(stderr)
    }

    /* fix merging SVGs */

    // get SVG file as string
    const preparedImageContent = fs.readFileSync(randomFilePath, 'utf-8')

    // remove `width` and `height` attributes from SVG string
    const updatedImageContent = preparedImageContent
      .replace(
        /<g id="id0:id0" transform="matrix.+></gim,
        '<g id="id0:id0" transform="translate(4,4)"><',
      )
      .replace(
        /<g id="id1:id1" transform="matrix.+"></gim,
        '<g id="id1:id1" transform="translate(0,0)"><',
      )
      .replace(
        /version=".+" width=".+" height=".+"/gim,
        'version="1.1" width="520.0" height="520.0"',
      )

    // write SVG file without `width` and `height` attributes
    fs.writeFileSync(randomFilePath, updatedImageContent, 'utf-8')

    console.info(`✅ successfully merged two SVG files: ${randomFilePath}`)
    return randomFilePath
  } catch (error) {
    console.error(`❌ failed to merge SVGs: ${error}`)
    throw error
  }
}
