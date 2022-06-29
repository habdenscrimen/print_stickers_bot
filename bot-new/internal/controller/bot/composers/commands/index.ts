import { Composer } from 'grammy'
import { BotContext } from '../../context'
import { startCommand } from './start-command'

export const commandsComposer = new Composer<BotContext>()

// NOTE: we don't need to call 'next()' at the end because `commandComposer` is the only composer that handles commands
commandsComposer.on('::bot_command', async (ctx) => {
  const command = ctx.message!.text!.substring(1)

  if (command === 'start') {
    // @ts-ignore
    await startCommand(ctx)
  }
})
