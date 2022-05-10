import fs from 'fs'
import { LayoutService } from '.'

export const addSVGBorder: LayoutService<'AddSVGBorder'> = (context, _, [filePath]) => {
  const logger = context.logger.child({ name: 'addSVGBorder' })

  // get border width
  const { borderWidthInPX: borderWidth } = context.config.layoutSizing

  // update SVG file content with border
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const updatedFileContent = fileContent.replace(
    /<svg xmlns/gim,
    `<svg style="border:${borderWidth}px solid white" xmlns`,
  )

  // write updated content to file
  fs.writeFileSync(filePath, updatedFileContent, 'utf-8')
  logger.debug('successfully added border to SVG file', { filePath })
}
