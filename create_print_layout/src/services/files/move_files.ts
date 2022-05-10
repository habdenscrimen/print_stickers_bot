import fs from 'fs'
import { FileService } from '.'

export const moveFiles: FileService<'MoveFiles'> = (
  context,
  [sourcePaths, destinationPath],
) => {
  const logger = context.logger.child({ name: 'moveFiles' })

  // check if destination directory exists. If not, create it.
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true })
  }
  logger.debug('created destination directory')

  // move files
  sourcePaths.forEach((sourcePath) => {
    const fileName = sourcePath.replace(/.+\//g, '')

    fs.renameSync(sourcePath, `${destinationPath}/${fileName}`)
  })
  logger.debug('moved files', { sourcePaths, destinationPath })
}
