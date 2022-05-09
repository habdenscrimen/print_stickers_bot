import { Context } from '../context'
import { countUnprocessedImagesCommand } from './count_unprocessed_images'

interface Commands {
  CountUnprocessedImages: () => Promise<void>
  // CreateLayouts: () => Promise<void>
  // DownloadProcessedLayouts: () => Promise<void>
}

export type Command<CommandName extends keyof Commands> = (
  context: Context,
  args: Parameters<Commands[CommandName]>,
) => ReturnType<Commands[CommandName]>

export const newCommands = (context: Context): Commands => {
  return {
    CountUnprocessedImages: () => countUnprocessedImagesCommand(context, []),
  }
}
