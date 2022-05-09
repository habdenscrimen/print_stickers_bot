import { Context } from '../../context'
import { newTempFilePath } from './new_temp_file_path'
import { FileServices } from '..'

export type FileService<HandlerName extends keyof FileServices> = (
  context: Context,
  args: Parameters<FileServices[HandlerName]>,
) => ReturnType<FileServices[HandlerName]>

export const newFileServices = (context: Context): FileServices => {
  return {
    NewTempFilePath: (...args) => newTempFilePath(context, [...args]),
  }
}
