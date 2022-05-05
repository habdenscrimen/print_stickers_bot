import { exec } from 'child_process'
import { promisify } from 'util'
import files from '../files'

/**
 * mergeSVGs merges two SVG files into one.
 * Used to merge SVG outline with SVG image.
 */
export const mergeSVGs = async (
  firstSVGPath: string,
  secondSVGPath: string,
  mergeMargin: number,
) => {
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

    console.info(`✅ successfully merged two SVG fles: ${randomFilePath}`)
    return randomFilePath
  } catch (error) {
    console.error(`❌ failed to merge SVGs: ${error}`)
    throw error
  }
}
