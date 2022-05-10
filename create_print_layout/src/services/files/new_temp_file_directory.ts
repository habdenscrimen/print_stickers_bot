import { FileService } from '.'

export const newTempFileDirectory: FileService<'NewTempFileDirectory'> = (
  context,
  [extension],
) => {
  return `${context.config.localFiles.tempDirectory}/${Math.random()}.${extension}`
}
