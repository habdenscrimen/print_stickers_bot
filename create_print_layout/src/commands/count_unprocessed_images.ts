import { Command } from '.'

export const countUnprocessedImagesCommand: Command<'CountUnprocessedImages'> = async (
  context,
) => {
  const logger = context.logger.child({ name: 'countUnprocessedImagesCommand' })

  // get confirmed order ids
  const orderIDs = await context.db.GetOrderIDsByStatus(['confirmed'])
  logger.debug('got order ids', { orderIDs })

  // count unprocessed (confirmed) images
  const countByOrderPromise = orderIDs.map(async (orderID) => {
    const path = `${context.config.storage.paths.rawImages}/${orderID}`

    const files = await context.storage.GetFiles(path)
    return files.length
  })

  const countByOrder = await Promise.all(countByOrderPromise)

  const totalCount = countByOrder.reduce((acc, count) => acc + count, 0)
  logger.info('counted unprocessed images', { totalCount })
}
