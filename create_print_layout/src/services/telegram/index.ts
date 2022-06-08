import { Context } from '../../context'
import { TelegramServices } from '..'
import { getFileBuffer } from './get_file_buffer'

export type TelegramService<HandlerName extends keyof TelegramServices> = (
  context: Context,
  args: Parameters<TelegramServices[HandlerName]>,
) => ReturnType<TelegramServices[HandlerName]>

export const newTelegramServices = (context: Context): TelegramServices => {
  return {
    GetFileBuffer: (...args) => getFileBuffer(context, [...args]),
  }
}
