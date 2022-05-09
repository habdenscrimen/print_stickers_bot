import admin from 'firebase-admin'
import { countFiles } from './count_files'

export interface Storage {
  CountFiles: (path: string) => Promise<number>
}

export type Handler<HandlerName extends keyof Storage> = (
  database: admin.storage.Storage,
  args: Parameters<Storage[HandlerName]>,
) => ReturnType<Storage[HandlerName]>

export const newStorage = (): Storage => {
  const storage = admin.storage()

  return {
    CountFiles: (args) => countFiles(storage, [args]),
  }
}
