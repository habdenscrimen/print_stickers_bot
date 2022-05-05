import { promisify } from 'util'
import fs from 'fs'
import { config } from './config'

/** deleteFiles deletes files by file path. */
const deleteFiles = async (filePaths: string[]) => {
  try {
    await Promise.all(filePaths.map((filePath) => promisify(fs.unlink)(filePath)))

    console.info(`✅ successfully deleted files: ${filePaths.join(', ')}`)
  } catch (error) {
    console.error(`❌ failed to delete files: ${error}`)
    throw error
  }
}

/** generateTempFilePath generates a new temp file path. */
const generateTempFilePath = (prefix: string, ext: string) => {
  return `${config.files.tempFilesDirectory}/${prefix}_${Math.random()}.${ext}`
}

/** createTempFilesDirectory creates a temp files directory. */
const createTempFilesDirectory = () => {
  try {
    const { tempFilesDirectory } = config.files

    // remove directory if exists
    if (fs.existsSync(tempFilesDirectory)) {
      fs.rmSync(tempFilesDirectory, { recursive: true })
    }

    // create a new temp files directory
    fs.mkdirSync(tempFilesDirectory)

    console.info(
      `✅ successfully created temp files directory: ${config.files.tempFilesDirectory}`,
    )
  } catch (error) {
    console.error(`❌ failed to create temp files directory: ${error}`)
    throw error
  }
}

export default {
  deleteFiles,
  generateTempFilePath,
  createTempFilesDirectory,
}
