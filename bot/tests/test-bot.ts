import { Api } from 'grammy'
import { Update } from 'grammy/out/platform.node'
import { newApp } from '../src/internal/app'
import { StickerData } from './refund/fixtures/stickers_data'

interface OutgoingRequest {
  method: string
  payload: {
    chat_id: number
    text: string

    deleteInFuture?: boolean
    parse_mode?: string
    reply_markup?: {
      inline_keyboard?: Array<Array<InlineButton>>
      keyboard?: Array<Array<Button>>
    }

    // invoice data
    title?: string
    description?: string
    payload?: string
    provider_token?: string
    currency?: string
    prices?: { label: string; amount: number }[]
    protect_content?: boolean
    start_parameter?: string
    provider_data?: string

    // pre-checkout
    pre_checkout_query_id?: string
    ok?: boolean
  }
}

interface InlineButton {
  text: string
  callback_data?: string
  url?: string
}

interface Button {
  text: string
  request_contact?: boolean
}

interface PreCheckoutQuery {
  pre_checkout_query_id: string
  ok: boolean
}

export class TestBot {
  private outgoingRequests: OutgoingRequest[] = []

  private chatID = this.newRandom('number') as number

  // TODO: save updates (to check bot's replies)

  constructor(private bot: ReturnType<typeof newApp>['bot'], private tgApi: Api) {}

  public async init() {
    // @ts-expect-error
    this.bot.api.config.use((prev, method, payload, signal) => {
      if (method !== 'getMe') {
        this.outgoingRequests.unshift({
          method,
          payload: payload as OutgoingRequest['payload'],
        })
      }

      return { ok: true, result: true }
      // return prev(method, payload, signal)
    })

    this.bot.botInfo = {
      id: 42,
      first_name: 'Test Bot',
      is_bot: true,
      username: 'bot',
      can_join_groups: true,
      can_read_all_group_messages: true,
      supports_inline_queries: false,
    }

    await this.bot.api.getMe()

    return this.bot.init()
  }

  public getOutgoingRequests() {
    return this.outgoingRequests
  }

  public resetOutgoingRequests() {
    this.outgoingRequests = []
  }

  public sendMessage(message: string) {
    const messageUpdate: Update = {
      update_id: this.newRandom('number') as number,
      message: {
        ...this.getMessageData()!,
        text: message,
      },
    }

    return this.bot.handleUpdate(messageUpdate)
  }

  public sendCommand(command: string) {
    const messageUpdate: Update = {
      update_id: this.newRandom('number') as number,
      message: {
        ...this.getMessageData()!,
        text: `/${command}`,
        entities: [{ offset: 0, length: command.length + 1, type: 'bot_command' }],
      },
    }

    return this.bot.handleUpdate(messageUpdate)
  }

  public sendSticker(stickerData: StickerData) {
    const messageUpdate: Update = {
      update_id: this.newRandom('number') as number,
      message: {
        ...this.getMessageData()!,
        sticker: stickerData,
      },
    }

    return this.bot.handleUpdate(messageUpdate)
  }

  public sendContact() {
    const messageUpdate: Update = {
      update_id: this.newRandom('number') as number,
      message: {
        ...this.getMessageData()!,
        contact: this.getContactData(),
      },
    }

    return this.bot.handleUpdate(messageUpdate)
  }

  /** Send pre-checkout query for invoice. Will use invoice payload from last invoice in chat by default. */
  public sendPreCheckoutQuery() {
    const invoice = this.getInvoice()

    const messageUpdate: Update = {
      update_id: this.newRandom('number') as number,
      pre_checkout_query: {
        id: this.newRandom('string') as string,
        from: {
          id: this.chatID,
          is_bot: false,
          first_name: 'Tester',
          last_name: 'Tester',
          language_code: 'uk',
        },
        currency: 'UAH',
        total_amount: 100, // 1 uah
        invoice_payload: invoice!.payload!,
      },
    }

    return this.bot.handleUpdate(messageUpdate)
  }

  /** Send successful payment update. Will use invoice payload from last invoice in chat by default. */
  public sendSuccessfulPayment() {
    const invoice = this.getInvoice()

    const messageUpdate: Update = {
      update_id: this.newRandom('number') as number,
      message: {
        ...this.getMessageData()!,
        successful_payment: {
          currency: 'UAH',
          total_amount: 100, // 1 uah
          invoice_payload: invoice!.payload!,
          // telegram_payment_charge_id: '5368390662_5313421498_1459',
          // provider_payment_charge_id: '1992467553',
          telegram_payment_charge_id: this.newRandom('string') as string,
          provider_payment_charge_id: this.newRandom('string') as string,
        },
      },
    }

    return this.bot.handleUpdate(messageUpdate)
  }

  public getInlineButtons(): InlineButton[] {
    if (!this.outgoingRequests.length) {
      return []
    }

    return this.outgoingRequests[0].payload.reply_markup!.inline_keyboard!.flat()
  }

  public getButtons(): Button[] {
    if (!this.outgoingRequests.length) {
      return []
    }

    return this.outgoingRequests[0].payload.reply_markup!.keyboard!.flat()
  }

  public getText(): string {
    const lastUpdateWithTextMessage = this.outgoingRequests.find(
      (update) => update.method === 'sendMessage' || update.method === 'editMessageText',
    )

    if (lastUpdateWithTextMessage) {
      return lastUpdateWithTextMessage.payload.text
    }

    return ''
  }

  public getInvoice() {
    const lastUpdateWithInvoice = this.outgoingRequests.find(
      (update) => update.method === 'sendInvoice',
    )

    if (lastUpdateWithInvoice) {
      return lastUpdateWithInvoice.payload
    }

    return null
  }

  public getPreCheckoutQuery(): PreCheckoutQuery {
    const lastUpdateWithPreCheckoutQuery = this.outgoingRequests.find(
      (update) => update.method === 'answerPreCheckoutQuery',
    )

    if (lastUpdateWithPreCheckoutQuery) {
      return lastUpdateWithPreCheckoutQuery.payload as PreCheckoutQuery
    }

    return {} as PreCheckoutQuery
  }

  public async clickInlineButton(buttonText: string) {
    try {
      const callbackData = this.getInlineButtons().find(
        ({ text }) => text === buttonText,
      )!.callback_data

      const callbackQueryUpdate: Update = {
        update_id: this.newRandom('number') as number,
        callback_query: {
          id: this.newRandom('string') as string,
          from: {
            id: this.chatID,
            is_bot: false,
            first_name: 'Tester',
            last_name: 'Tester',
            language_code: 'uk',
          },
          chat_instance: this.newRandom('string') as string,
          message: {
            ...this.getMessageData()!,
            text: '',
          },
          data: callbackData,
        },
      }

      return this.bot.handleUpdate(callbackQueryUpdate)
    } catch (error) {
      console.error(`failed to click button "${buttonText}": ${error}`)
      throw new Error(`failed to click button "${buttonText}": ${error}`)
    }
  }

  private getMessageData(): Update['message'] {
    return {
      message_id: this.newRandom('number') as number,
      from: {
        id: this.chatID,
        is_bot: false,
        first_name: 'Tester',
        last_name: 'Tester',
        language_code: 'uk',
      },
      chat: {
        id: this.chatID,
        first_name: 'Tester',
        last_name: 'Tester',
        type: 'private',
      },
      date: new Date().getTime(),
    }
  }

  private getContactData() {
    return {
      phone_number: '+123456789',
      first_name: 'Test',
      user_id: this.chatID,
    }
  }

  private newRandom(type: 'number' | 'string') {
    switch (type) {
      case 'number':
        return Math.floor(Math.random() * 100000)
      case 'string':
        return (
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15)
        )
      default:
        return (
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15)
        )
    }
  }
}
