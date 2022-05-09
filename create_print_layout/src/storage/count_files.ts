import { Handler } from '.'

export const countFiles: Handler<'CountFiles'> = async (storage, [path]) => {
  // get files from storage
  const [files] = await storage.bucket().getFiles({
    prefix: path,
  })

  return files.length
}
