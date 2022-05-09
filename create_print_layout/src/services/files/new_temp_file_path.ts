import { FileService } from '.'

export const newTempFilePath: FileService<'NewTempFilePath'> = (context, [extension]) => {
  return `${context.config.localFiles.tempDirectory}/${Math.random()}.${extension}`
}
