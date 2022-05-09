import { Config } from '../config'
import { LayoutSizing } from '../types'

/** getSizeInPX returns sizing in px according to sizing requirements in mm. */
export const getSizingInPX = (layoutSizeInMM: Config['layouts']): LayoutSizing => {
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
  const maxLayoutWidthInPX = layoutSizeInMM.maxWidthInMM * coefficient
  const gapInPX = horizontalGapInMM * coefficient

  return {
    avgStickerWidth: stickerWidthInPX,
    maxLayoutWidth: maxLayoutWidthInPX,
    gap: gapInPX,
  }
}
