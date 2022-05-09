import GraphicsMagick from 'gm'
import { promisify } from 'util'
import fs from 'fs'
import { exec } from 'child_process'
import { ImageService } from '.'

const gm = GraphicsMagick.subClass({ imageMagick: true })

export const mergeSVGs: ImageService<'MergeSVGs'> = async (
  context,
  fileServices,
  [firstSVGPath, secondSVGPath, mergeMargin],
) => {
  const logger = context.logger.child({ name: 'mergeSVGs' })

  // create a path for the merged SVG
  const mergedFilePath = fileServices.NewTempFilePath('svg')
  logger.debug('merged file path', { mergedFilePath })

  // merge SVGs using Python script
  const command = `python3 ${__dirname}/merge_svgs.py --margin=-${mergeMargin} ${firstSVGPath} ${secondSVGPath} > ${mergedFilePath}`

  const { stderr } = await promisify(exec)(command)
  if (stderr) {
    logger.error('failed to merge SVG files', { stderr })
    throw new Error(stderr)
  }
  logger.debug('merged two SVG files', { mergedFilePath })

  const mergedSVGContent = fs.readFileSync(mergedFilePath, 'utf-8')

  // fix merging SVGs
  const updatedSVGContent = mergedSVGContent
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

  // update SVG file on disk
  fs.writeFileSync(mergedFilePath, updatedSVGContent, 'utf-8')
  logger.debug('fixed merging', { mergedFilePath })

  logger.debug('merged two SVG files', { mergedFilePath })
  return mergedFilePath
}
