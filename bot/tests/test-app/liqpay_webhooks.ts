import Base64 from 'crypto-js/enc-base64'
import crypto from 'crypto-js'
import fetch from 'node-fetch'
import { WebhookPayload } from '../../src/functions/liqpay-webhook'

interface WebhookBody {
  data: string
  signature: string
}

export class TestLiqpayWebhooks {
  constructor(private privateKey: string, private url: string) {}

  public sendSuccessfulPaymentWebhook(orderID: string) {
    const payload = this.newPayload({
      action: 'pay',
      status: 'success',
      order_id: orderID,
      transaction_id: 123,
      amount: 100,
    })

    return this.sendWebhook(`${this.url}?order_id=${orderID}`, payload)
  }

  private sendWebhook(url: string, body: WebhookBody) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  private newPayload(data: WebhookPayload): WebhookBody {
    const dataBase64 = Buffer.from(JSON.stringify(data)).toString('base64')
    const signature = Base64.stringify(
      crypto.SHA1(this.privateKey + dataBase64 + this.privateKey),
    )

    return {
      data: dataBase64,
      signature,
    }
  }
}
