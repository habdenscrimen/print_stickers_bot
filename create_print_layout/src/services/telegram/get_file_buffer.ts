import fetch from 'node-fetch'
import download from 'download'
import { TelegramService } from '.'

export const getFileBuffer: TelegramService<'GetFileBuffer'> = async (
  context,
  [filePath],
) => {
  const logger = context.logger.child({ name: 'getFileBuffer' })

  const { botToken } = context.config.telegram

  // // get file path
  // const response = await fetch(
  //   `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileID}`,
  // )
  // const telegramFile = (await response.json()) as { result: { file_path: string } }
  // const filePath = telegramFile.result.file_path
  // logger.debug('got file path', { filePath })

  // get file buffer
  const buffer = download(filePath)
  logger.debug('downloaded file buffer')

  return buffer
}
