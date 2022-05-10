import fs from 'fs'
import { FileService } from '.'

export const deleteTempFileDirectory: FileService<'DeleteTempFileDirectory'> = (
  context,
) => {
  const logger = context.logger.child({ name: 'deleteTempFileDirectory' })

  const { tempDirectory } = context.config.localFiles

  if (fs.existsSync(tempDirectory)) {
    fs.rmSync(tempDirectory, { recursive: true })
  }
  logger.debug('deleted temp directory')
}
