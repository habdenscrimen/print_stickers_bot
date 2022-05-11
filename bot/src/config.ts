export const newConfig = () => {
  const config = {
    database: {
      url: `https://print-stickers-default-rtdb.europe-west1.firebasedatabase.app/`,
      sessionStorageKey: 'bot_session',
    },
    storage: {
      bucket: `gs://print-stickers.appspot.com`,
      paths: {
        rawImages: 'raw_images',
        printReadyImages: 'print_ready_images',
        printReadyLayouts: 'print_ready_layouts',
      },
    },
  }

  return config
}

export type Config = ReturnType<typeof newConfig>
