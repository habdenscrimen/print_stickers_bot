import { LayoutService } from '.'

export const getSizingInPX: LayoutService<'GetSizingInPX'> = (context) => {
  const {
    layoutSizing: {
      maxHeightInMM: maxLayoutHeightInMM,
      maxWidthInMM: maxLayoutWidthInMM,
      borderWidthInPX,
    },
    imageSizing: {
      widthInMM: imageWidthInMM,
      widthInPX: imageWidthInPX,
      heightInPX: imageHeightInPX,
      gapInMM: imageGapInMM,
    },
  } = context.config

  // calculate sizing in px
  const coefficient = imageWidthInPX / imageWidthInMM
  const maxLayoutWidthInPX = maxLayoutWidthInMM * coefficient
  const maxLayoutHeightInPX = maxLayoutHeightInMM * coefficient
  const imageGapInPX = imageGapInMM * coefficient

  // calculate max images per layout
  const maxImagesPerRow = Math.floor(
    (maxLayoutWidthInPX - imageGapInMM - borderWidthInPX * 2) /
      (imageWidthInPX + imageGapInPX),
  )
  const maxImagesPerColumn = Math.floor(
    (maxLayoutHeightInPX - imageGapInMM - borderWidthInPX * 2) /
      (imageHeightInPX + imageGapInPX),
  )
  const maxImagesPerLayout = maxImagesPerRow * maxImagesPerColumn

  return {
    maxImagesPerLayout,
    maxImagesPerRow,
    maxImagesPerColumn,
    gap: imageGapInPX,
  }
}
