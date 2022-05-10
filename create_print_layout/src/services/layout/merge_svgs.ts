import { exec } from 'child_process'
import { promisify } from 'util'
import { LayoutService } from '.'

export const mergeSVGs: LayoutService<'MergeSVGs'> = async (
  context,
  fileServices,
  [firstSVGPath, secondSVGPath, mergeMargin, direction],
) => {
  const logger = context.logger.child({ name: 'mergeSVGs' })

  // generate a random file path
  const mergedFilePath = fileServices.NewTempFilePath('svg')
  logger.debug('generated random file path', { mergedFilePath })

  // merge SVGs using the Python script
  const command = `python3 ${__dirname}/merge_svgs.py --direction=${direction} --margin=${mergeMargin} ${firstSVGPath} ${secondSVGPath} > ${mergedFilePath}`

  const { stderr } = await promisify(exec)(command)
  if (stderr) {
    logger.error('failed to merge SVGs', { stderr })
    throw new Error(stderr)
  }

  return mergedFilePath
}
