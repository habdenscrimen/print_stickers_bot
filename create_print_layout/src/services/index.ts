export interface Services {
  Image: ImageServices
  File: FileServices
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
