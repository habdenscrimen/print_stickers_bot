import { Config } from '../config'

/** createPrintLayouts creates print layout(s) from SVG images. */
const createPrintLayouts = async (
  config: Config,
  images: Buffer[],
): Promise<Buffer[]> => {
  const { width, gap, stickerWidth } = getSizingInPX(config.layouts)

  console.log({ width, gap, stickerWidth })

  return []
}

/** getSizeInPX returns sizing in px according to sizing requirements in mm. */
const getSizingInPX = (layoutSizeInMM: Config['layouts']) => {
  // size in mm
  const horizontalGapInMM = 8
  const stickersInRow = 6
  const gapCount = stickersInRow + 1
  const stickerWidthInMM =
    (layoutSizeInMM.maxWidthInMM - horizontalGapInMM * gapCount) / stickersInRow

  // size in px
  const stickerWidthInPX = 520

  // calculate coefficient to convert mm to px
  const coefficient = stickerWidthInPX / stickerWidthInMM

  // calculate width and gap in px
  const widthInPX = layoutSizeInMM.maxWidthInMM * coefficient
  const gapInPX = horizontalGapInMM * coefficient

  return {
    stickerWidth: stickerWidthInPX,
    width: widthInPX,
    gap: gapInPX,
  }
}

export const layoutService = {
  createPrintLayouts,
}
