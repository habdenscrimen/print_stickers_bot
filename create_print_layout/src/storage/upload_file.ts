import { Handler } from '.'

export const uploadFile: Handler<'UploadFile'> = async (storage, [file, path]) => {
  const storageFile = storage.bucket().file(path)

  return storageFile.save(file)
}
