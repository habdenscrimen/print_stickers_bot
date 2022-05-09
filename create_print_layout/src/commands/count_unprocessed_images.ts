import { Command } from './commands'

export const countUnprocessedImagesCommand: Command<'CountUnprocessedImages'> = async (
  context,
) => {
  const logger = context.logger.child({ name: 'countUnprocessedImagesCommand' })

  logger.info('Counting unprocessed images...')
  logger.debug('Counting unprocessed images...')
  // console.log('countUnprocessedImagesCommand')
  // console.log({ context })
}
