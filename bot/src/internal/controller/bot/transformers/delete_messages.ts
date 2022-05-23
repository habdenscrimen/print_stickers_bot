import { Api, RawApi, Transformer } from 'grammy'

class DeleteMessages {
  private messageIDs: Map<number, number[]> = new Map()

  public addIDs = (chatID: number, messageID: number) => {
    const ids = this.messageIDs.get(chatID) || []

    this.messageIDs.set(chatID, [...ids, messageID])
  }

  public delete = async (api: Api<RawApi>, chatID: number) => {
    try {
      const chatMessageIDs = this.messageIDs.get(chatID) || []

      // if no messages to delete and no replyParallelWithDeletion, return
      if (chatMessageIDs.length === 0) {
        return
      }

      // delete messages
      await Promise.all(chatMessageIDs.map((messageID) => api.deleteMessage(chatID, messageID)))

      // clear message ids after deletion
      this.messageIDs.set(chatID, [])
    } catch (error) {
      console.error(`failed to delete messages`, { error })
    }
  }
}

const deleteMessages = new DeleteMessages()

export const deleteMessagesTransformer: (api: Api<RawApi>) => Transformer =
  (api) => async (prev, method, payload, signal) => {
    if (payload && 'deletePrevBotMessages' in payload && 'chat_id' in payload) {
      const { deletePrevBotMessages, chat_id } = payload as {
        deletePrevBotMessages: boolean
        chat_id: number
      }

      if (deletePrevBotMessages) {
        const [response] = await Promise.all([
          prev(method, payload, signal),
          deleteMessages.delete(api, chat_id),
        ])

        if ('deleteInFuture' in payload && response.ok && 'message_id' in response.result) {
          deleteMessages.addIDs(chat_id, response.result.message_id)
        }

        return response
      }
    }

    if (payload && 'deleteInFuture' in payload && 'chat_id' in payload) {
      const response = await prev(method, payload, signal)

      if (method !== 'sendMessage' || !response.ok || !('message_id' in response.result)) {
        return response
      }

      const { message_id } = response.result
      const { deleteInFuture, chat_id }: { deleteInFuture: boolean; chat_id: number } = payload

      if (deleteInFuture) {
        deleteMessages.addIDs(chat_id, message_id)
      }

      return response
    }

    return prev(method, payload, signal)
  }
