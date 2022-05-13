import 'dotenv/config'

export const newConfig = () => {
  const config = {
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
      layoutsDirectory: `/Users/slava/Documents/Stickers/Layouts`,
    },
    layoutSizing: {
      minWidthInMM: 10,
      maxWidthInMM: 300,
      minHeightInMM: 10,
      maxHeightInMM: 420,
      borderWidthInPX: 20,
    },
    imageSizing: {
      outlineWidth: 4,
      widthInMM: 40,
      widthInPX: 520,
      heightInMM: 40,
      heightInPX: 520,
      gapInMM: 8,
    },
    telegram: {
      botToken: process.env.BOT_TOKEN!,
    },
  }

  return config
}

export type Config = ReturnType<typeof newConfig>
