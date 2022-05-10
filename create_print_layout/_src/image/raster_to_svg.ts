import { exec } from 'child_process'
import { promisify } from 'util'
import files from '../files'

/**
 * convertRasterImageToVector convers raster image to SVG using `inkscape`.
 * `inkscape` should be installed separately.
 */
export const rasterImageToSVG = async (rasterImageFilePath: string): Promise<string> => {
  try {
    // create random file name
    const randomFilePath = files.generateTempFilePath('image', 'svg')

    // FIXME: `inkscape` opens confirmation popup (user should click "OK") and blocks the process.
    // Consider using another tool for converting raster image to SVG.
    const command = `inkscape --export-filename=${randomFilePath} ${rasterImageFilePath}`

    const { stderr } = await promisify(exec)(command)
    if (stderr) {
      console.error(`❌ failed to convert raster image to SVG: ${stderr}`)
      throw new Error(stderr)
    }

    console.info(`✅ successfully converted raster image to SVG: ${randomFilePath}`)
    return randomFilePath
  } catch (error) {
    console.error(`❌ failed to convert raster image to SVG: ${error}`)
    throw error
  }
}
