import { FileServices, LayoutServices } from '..'
import { Context } from '../../context'
import { getSizingInPX } from './get_sizing_in_px'
import { addSVGBorder } from './add_svg_border'
import { mergeSVGs } from './merge_svgs'

export type LayoutService<HandlerName extends keyof LayoutServices> = (
  context: Context,
  fileServices: FileServices,
  args: Parameters<LayoutServices[HandlerName]>,
) => ReturnType<LayoutServices[HandlerName]>

export const newLayoutServices = (
  context: Context,
  fileServices: FileServices,
): LayoutServices => {
  return {
    GetSizingInPX: (...args) => getSizingInPX(context, fileServices, [...args]),
    MergeSVGs: (...args) => mergeSVGs(context, fileServices, [...args]),
    AddSVGBorder: (...args) => addSVGBorder(context, fileServices, [...args]),
  }
}
