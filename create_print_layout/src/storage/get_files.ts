import { Handler } from '.'

export const getFiles: Handler<'GetFiles'> = async (storage, [path]) => {
  // get files from storage
  const [files] = await storage.bucket().getFiles({
    prefix: path,
  })

  return files
}
