import { Command } from '.'

export const countUnprocessedImagesCommand: Command<'CountUnprocessedImages'> = async (
  context,
) => {
  const logger = context.logger.child({ name: 'countUnprocessedImagesCommand' })

  // get confirmed order file IDs
  const confirmedOrderFileIDs = await context.db.GetConfirmedOrderFileIDs()

  const count = confirmedOrderFileIDs.length
  logger.info('counted unprocessed images', { count })

  console.log(`\n🎉 ${count} images`)
}
