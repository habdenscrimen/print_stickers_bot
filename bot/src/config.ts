export const newConfig = () => {
  const config = {
    database: {
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
    stickerPriceUAH: 10,
    deliveryCostUAH: 41,
  }

  return config
}

export type Config = ReturnType<typeof newConfig>
