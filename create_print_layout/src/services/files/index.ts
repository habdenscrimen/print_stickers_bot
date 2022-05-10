import fs from 'fs'
import { Context } from '../../context'
import { FileServices } from '..'
import { newTempFileDirectory } from './new_temp_file_directory'
import { deleteTempFileDirectory } from './delete_temp_file_directory'
import { moveFiles } from './move_files'

export type FileService<HandlerName extends keyof FileServices> = (
  context: Context,
  args: Parameters<FileServices[HandlerName]>,
) => ReturnType<FileServices[HandlerName]>

export const newFileServices = (context: Context): FileServices => {
  // create or clear directory for temp files
  createOrClearTempFilesDirectory(context.config.localFiles.tempDirectory)

  return {
    NewTempFileDirectory: (...args) => newTempFileDirectory(context, [...args]),
    MoveFiles: (...args) => moveFiles(context, [...args]),
    DeleteTempFileDirectory: (...args) => deleteTempFileDirectory(context, [...args]),
  }
}

const createOrClearTempFilesDirectory = (directoryPath: string) => {
  // remove directory if exists
  if (fs.existsSync(directoryPath)) {
    fs.rmSync(directoryPath, { recursive: true })
  }

  // create a new temp files directory
  fs.mkdirSync(directoryPath)
}
