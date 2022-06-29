import { Filter, Middleware } from 'grammy'
import { BotContext } from '../../context'

type CommandContext = Filter<
  Omit<BotContext, 'match'> & {
    match: Extract<BotContext['match'], string>
  },
  ':entities:bot_command'
>

export type Command = Middleware<CommandContext>
