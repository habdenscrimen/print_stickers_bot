import admin from 'firebase-admin'

/** getFiles gets files for specified path. */
/* eslint-disable-next-line */
const getFiles = async (path: string) => {
  try {
    console.info(`ℹ️  getting order file streams from storage`)

    // get files from storage
    const [files] = await admin.storage().bucket().getFiles({
      prefix: path,
    })

    console.info(`✅ successfully got files from storage`)
    return files
  } catch (error) {
    console.error(`❌ failed to get order images: ${error}`)
    return []
  }
}

/** uploadFileBuffer uploads file buffer to Storage */
const uploadFileBuffer = async (fileBuffer: Buffer, path: string): Promise<void> => {
  try {
    console.info(`ℹ️ uploading file buffer to storage`)

    // TODO: fix file format
    const file = admin.storage().bucket().file(path)

    await file.save(fileBuffer)

    console.info(`✅ successfully uploaded file buffer to storage`)
  } catch (error) {
    console.error(`❌ failed to upload file buffer to storage: ${error}`)
  }
}

/** countFiles counts files by path. */
const countFiles = async (path: string): Promise<number> => {
  try {
    console.info(`ℹ️ counting files in storage`)

    // get files from storage
    const [files] = await admin.storage().bucket().getFiles({
      prefix: path,
    })

    console.info(`✅ successfully counted files in storage`)
    return files.length
  } catch (error) {
    console.error(`❌ failed to count files in storage: ${error}`)
    return 0
  }
}

export default {
  getFiles,
  countFiles,
  uploadFileBuffer,
}
