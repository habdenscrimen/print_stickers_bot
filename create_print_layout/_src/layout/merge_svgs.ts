import { exec } from 'child_process'
import { promisify } from 'util'
import files from '../files'

const asyncExec = promisify(exec)

/** mergeSVGs merges two SVGs. */
export const mergeSVGs = async (
  firstSVGPath: string,
  secondSVGPath: string,
  margin: number,
  direction: 'h' | 'v',
  postfix = '',
): Promise<string> => {
  const randomFilePath = files.generateTempFilePath(`merged-image-${postfix}`, 'svg')

  const command = `python3 ${__dirname}/merge_svgs.py --direction=${direction} --margin=${margin} ${firstSVGPath} ${secondSVGPath} > ${randomFilePath}`

  const { stderr } = await asyncExec(command)
  if (stderr) {
    console.error(`❌ failed to merge SVG files: ${stderr}`)
    throw new Error(stderr)
  }

  return randomFilePath
}
