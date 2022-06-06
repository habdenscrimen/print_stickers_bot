import { Filter, Middleware } from 'grammy'
import { BotContext } from '..'
import { start, startWithoutReferral } from './start'

type CommandContext = Filter<
  Omit<BotContext, 'match'> & {
    match: Extract<BotContext['match'], string>
  },
  ':entities:bot_command'
>

export type Command = Middleware<CommandContext>

export const commands = {
  start,
  startWithoutReferral,
}
