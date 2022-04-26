import download from 'download'
import fs from 'fs'

export const createDirectoryIfNotExist = (filesDirectory: string) => {
  if (!fs.existsSync(filesDirectory)) {
    fs.mkdirSync(filesDirectory, { recursive: true })
  }
}

// TODO: add error handling
export const downloadFile = async (
  url: string,
  fileID: string,
  downloadDirectory: string,
) => {
  // download file by url
  const fileExtension = url.split('.').pop()

  await download(url, downloadDirectory, {
    filename: `${fileID}.${fileExtension}`,
  })
}
