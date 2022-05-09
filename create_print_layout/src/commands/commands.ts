import { Context } from '../context'

interface Commands {
  CountUnprocessedImages: () => Promise<void>
  CreateLayouts: () => Promise<void>
  DownloadProcessedLayouts: () => Promise<void>
  Exit: () => void
}

export type Command<CommandName extends keyof Commands> = (
  context: Context,
  args: Parameters<Commands[CommandName]>,
) => ReturnType<Commands[CommandName]>
