import admin from 'firebase-admin'
import { File } from '@google-cloud/storage'
import { getFiles } from './get_files'
import { uploadFile } from './upload_file'

export interface Storage {
  GetFiles: (path: string) => Promise<File[]>
  UploadFile: (file: Buffer, path: string) => Promise<void>
}

export type Handler<HandlerName extends keyof Storage> = (
  stoage: admin.storage.Storage,
  args: Parameters<Storage[HandlerName]>,
) => ReturnType<Storage[HandlerName]>

export const newStorage = (): Storage => {
  const storage = admin.storage()

  return {
    GetFiles: (...args) => getFiles(storage, [...args]),
    UploadFile: (...args) => uploadFile(storage, [...args]),
  }
}
