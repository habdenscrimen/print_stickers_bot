export const newConfig = () => {
  const config = {
    database: {
      url: `https://print-stickers-default-rtdb.europe-west1.firebasedatabase.app/`,
    },
    storage: {
      bucket: `gs://print-stickers.appspot.com`,
      paths: {
        rawImages: 'raw_images',
        printReadyImages: 'print_ready_images',
        printReadyLayouts: 'print_ready_layouts',
      },
    },
    localFiles: {
      tempDirectory: `${process.cwd()}/temp_files`,
    },
    layoutSizing: {
      minWidthInMM: 10,
      maxWidthInMM: 300,
      minHeightInMM: 10,
      maxHeightInMM: 420,
      border: 20,
    },
    image: {
      outlineWidth: 4,
    },
  }

  return config
}

export type Config = ReturnType<typeof newConfig>
