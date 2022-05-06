import { Database } from 'firebase-admin/database'
import { Config } from '../config'
import database from '../database'
import storage from '../storage'

/** countPrintReadyImages counts print-ready images */
export const countPrintReadyImages = async (
  config: Config,
  db: Database,
): Promise<number> => {
  try {
    console.info(`ℹ️ counting print-ready images`)

    // get confirmed order ids
    const confirmedOrderIDs = await database.getConfirmedOrderIDs(db)

    // count print-ready images (from confirmed orders)
    const countByOrder = await Promise.all(
      confirmedOrderIDs.map((orderID) =>
        storage.countFiles(
          `${config.firebase.storage.paths.printReadyImages}/${orderID}`,
        ),
      ),
    )

    // get total count
    const totalCount = countByOrder.reduce((acc, count) => acc + count, 0)

    console.info(`✅ successfully counted print-ready images`)
    return totalCount
  } catch (error) {
    console.error(`❌ failed to count print-ready images: ${error}`)
    return 0
  }
}
