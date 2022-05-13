export interface Services {
  Image: ImageServices
  File: FileServices
  Layout: LayoutServices
  Telegram: TelegramServices
}

export interface TelegramServices {
  GetFileBuffer: (fileID: string) => Promise<Buffer>
}

export interface FileServices {
  NewTempFileDirectory: (extension: string) => string
  MoveFiles: (sourcePaths: string[], destinationPath: string) => void
  DeleteTempFileDirectory: () => void
}

export interface ImageServices {
  CreateSVGOutline: (
    file: Buffer,
  ) => Promise<{ filePath: string; originalHeight: number; originalWidth: number }>
  AddRasterWhiteOutline: (file: Buffer) => Promise<Buffer>
  RasterToSVG: (file: Buffer) => Promise<string>
  MergeSVGs: (firstSVGPath: string, secondSVGPath: string) => Promise<string>
}

export interface LayoutServices {
  GetSizingInPX: () => {
    maxImagesPerLayout: number
    maxImagesPerRow: number
    maxImagesPerColumn: number
    gap: number
  }
  MergeSVGs: (
    firstSVGPath: string,
    secondSVGPath: string,
    mergeMargin: number,
    direction: 'h' | 'v',
  ) => Promise<string>
  AddSVGBorder: (filePath: string) => void
}
