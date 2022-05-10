export interface Services {
  Image: ImageServices
  File: FileServices
  Layout: LayoutServices
}

export interface FileServices {
  NewTempFilePath: (extension: string) => string
}

export interface ImageServices {
  CreateSVGOutline: (
    file: Buffer,
  ) => Promise<{ filePath: string; originalHeight: number; originalWidth: number }>
  RasterToSVG: (file: Buffer) => Promise<string>
  MergeSVGs: (
    firstSVGPath: string,
    secondSVGPath: string,
    mergeMargin: number,
  ) => Promise<string>
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
