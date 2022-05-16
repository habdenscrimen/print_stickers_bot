import { Message } from 'grammy/out/platform.node'
import { CustomContext } from './context'

export const withDeleteMessage = (
  ctx: CustomContext,
  reply: (ctx: CustomContext) => Promise<Message.TextMessage>,
  addMessageToDelete = true,
) => {
  return ctx.services.Telegram.DeleteMessages(ctx, ctx.from!.id, {
    func: reply,
    addMessageToDelete,
  })
}
