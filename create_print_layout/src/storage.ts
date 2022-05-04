import admin from 'firebase-admin'
import getRawBody from 'raw-body'

/** getOrderFileBuffers retrieves file streams for specified order */
export const getOrderFileBuffers = async (orderID: string): Promise<Buffer[]> => {
  try {
    console.info(`ℹ️  getting order file streams from storage`)

    // get files from storage
    const [files] = await admin
      .storage()
      .bucket()
      .getFiles({
        prefix: `raw_images/${orderID}`,
      })

    // get file buffers
    const fileBuffersPromise = files.map((file) => getRawBody(file.createReadStream()))
    const fileBuffers = await Promise.all(fileBuffersPromise)

    console.info(`ℹ️  successfully got order file streams from storage`)
    return fileBuffers
  } catch (error) {
    console.error(`failed to get order images: ${error}`)
    return []
  }
}

/** uploadPrintLayout uploads print layout to Storage */
export const uploadPrintLayout = async (fileBuffer: Buffer, orderID: string) => {
  try {
    console.info(`ℹ️  uploading print layout to storage`)

    // TODO: fix file format
    const file = admin.storage().bucket().file(`layouts/${orderID}.webp`)

    await file.save(fileBuffer)

    console.info(`ℹ️  successfully uploaded print layout to storage`)
  } catch (error) {
    console.error(`failed to upload print layout: ${error}`)
  }
}
