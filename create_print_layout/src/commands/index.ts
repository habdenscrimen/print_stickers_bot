import { Context } from '../context'
import { Services } from '../services'
import { countUnprocessedImagesCommand } from './count_unprocessed_images'
import { createLayoutsCommand } from './create_layouts'

interface Commands {
  CountUnprocessedImages: () => Promise<void>
  CreateLayouts: () => Promise<void>
  // DownloadProcessedLayouts: () => Promise<void>
}

export type Command<CommandName extends keyof Commands> = (
  context: Context,
  services: Services,
  args: Parameters<Commands[CommandName]>,
) => ReturnType<Commands[CommandName]>

export const newCommands = (context: Context, services: Services): Commands => {
  return {
    CountUnprocessedImages: () => countUnprocessedImagesCommand(context, services, []),
    CreateLayouts: () => createLayoutsCommand(context, services, []),
  }
}
