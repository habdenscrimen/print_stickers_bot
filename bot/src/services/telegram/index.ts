import { TelegramServices } from '..'
import { CustomContext } from '../../context'
import { createStickerSet } from './create_sticker_set'
import { deleteStickerSet } from './delete_sticker_set'
import { sendAdminNotification } from './send_admin_notification'

export type TelegramService<HandlerName extends keyof TelegramServices> = (
  args: Parameters<TelegramServices[HandlerName]>,
) => ReturnType<TelegramServices[HandlerName]>

class DeleteMessages {
  private messageIDs: number[] = []

  public addMessageIDs = (messageIDs: number[]) => {
    console.log(`this.messageIDs: ${this.messageIDs}`)

    this.messageIDs.push(...messageIDs)
  }

  public deleteMessages = async (
    ctx: CustomContext,
    chatID: number,
    replyParallelWithDeletion?: {
      func: (ctx: CustomContext) => ReturnType<CustomContext['reply']>
      addMessageToDelete: boolean
    },
  ) => {
    try {
      // if no messages to delete and no replyParallelWithDeletion, return
      if (this.messageIDs.length === 0 && !replyParallelWithDeletion) {
        return
      }

      let newMessageID = 0

      // reply with a new message
      const reply = async () => {
        if (!replyParallelWithDeletion?.func) {
          return
        }

        const message = await replyParallelWithDeletion.func(ctx)
        newMessageID = message.message_id
      }

      // delete messages in parallel
      const deleteMessagesPromise = this.messageIDs.map((messageID) =>
        ctx.api.deleteMessage(chatID, messageID),
      )

      // delete message and reply a new one
      await Promise.all([...deleteMessagesPromise, reply()])

      // clear message ids after deletion
      this.messageIDs = []

      // if message id should be added to the list of messages to delete, add it
      if (replyParallelWithDeletion?.addMessageToDelete) {
        this.addMessageIDs([newMessageID])
      }
    } catch (error) {
      console.error(`failed to delete messages`, { error })
    }
  }
}

export const newTelegramServices = (): TelegramServices => {
  const deleteMessages = new DeleteMessages()

  return {
    CreateStickerSet: (...args) => createStickerSet(args),
    DeleteStickerSet: (...args) => deleteStickerSet(args),
    SendAdminNotification: (...args) => sendAdminNotification(args),
    AddMessagesToDelete: deleteMessages.addMessageIDs,
    DeleteMessages: deleteMessages.deleteMessages,
  }
}
