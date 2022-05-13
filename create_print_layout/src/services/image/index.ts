import { Context } from '../../context'
import { FileServices, ImageServices } from '..'
import { createSVGOutline } from './create_svg_outline'
import { rasterToSVG } from './raster_to_svg'
import { mergeSVGs } from './merge_svgs'
import { addRasterWhiteOutline } from './add_raster_white_outline'

export type ImageService<HandlerName extends keyof ImageServices> = (
  context: Context,
  fileServices: FileServices,
  args: Parameters<ImageServices[HandlerName]>,
) => ReturnType<ImageServices[HandlerName]>

export const newImageServices = (
  context: Context,
  fileServices: FileServices,
): ImageServices => {
  return {
    CreateSVGOutline: (...args) => createSVGOutline(context, fileServices, [...args]),
    RasterToSVG: (...args) => rasterToSVG(context, fileServices, [...args]),
    MergeSVGs: (...args) => mergeSVGs(context, fileServices, [...args]),
    AddRasterWhiteOutline: (...args) =>
      addRasterWhiteOutline(context, fileServices, [...args]),
  }
}
