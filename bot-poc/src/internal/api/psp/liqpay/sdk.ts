import fetch from 'node-fetch'
import crypto from 'crypto-js'
import Base64 from 'crypto-js/enc-base64'

interface RequestParams {
  version: number
  public_key: string
  private_key: string
}

interface CreateRefundOptions {
  orderID: string
  amount: number
}

interface CreateRefundResponse {
  action: string
  payment_id: string
  status: string

  code: string
  err_code?: string
  err_description?: string
  key: string
  result: string

  wait_amount: boolean
}

// interface GetReportsOptions {
//   dateFrom: number
//   dateTo: number
// }

// interface GetReportsResponse {
//   result: string
//   data: [
//     {
//       transaction_id: number
//       order_id: number
//       amount: number
//     },
//   ]
// }

export class LiqpaySDK {
  private apiHost: string

  private publicKey: string

  private privateKey: string

  private params: RequestParams

  constructor(publicKey: string, privateKey: string) {
    this.apiHost = `https://www.liqpay.ua/api/request`
    this.publicKey = publicKey
    this.privateKey = privateKey

    this.params = {
      version: 3,
      public_key: publicKey,
      private_key: privateKey,
    }
  }

  public createRefund = async (options: CreateRefundOptions): Promise<CreateRefundResponse> => {
    const params = {
      ...this.params,
      action: 'refund',
      order_id: options.orderID,
      amount: options.amount,
    }
    const data = Buffer.from(JSON.stringify(params)).toString('base64')
    const signature = Base64.stringify(crypto.SHA1(this.privateKey + data + this.privateKey))

    const urlParams = new URLSearchParams()
    urlParams.append('data', data)
    urlParams.append('signature', signature)

    const response = await fetch(this.apiHost, {
      method: 'POST',
      body: urlParams,
    })

    const apiData = (await response.json()) as CreateRefundResponse

    // check for errors
    if (
      (apiData.status === 'error' || apiData.result === 'error') &&
      apiData.err_code !== 'payment_err_status'
    ) {
      throw new Error(`Liqpay error: ${JSON.stringify(apiData)}`)
    }

    return apiData
  }

  // public getReports = async (options: GetReportsOptions) => {
  //   const params = {
  //     ...this.params,
  //     action: 'reports',
  //     date_from: options.dateFrom,
  //     date_to: options.dateTo,
  //   }

  //   const data = Buffer.from(JSON.stringify(params)).toString('base64')
  //   const signature = Base64.stringify(crypto.SHA1(this.privateKey + data + this.privateKey))

  //   const urlParams = new URLSearchParams()
  //   urlParams.append('data', data)
  //   urlParams.append('signature', signature)

  //   const response = await fetch(this.apiHost, {
  //     method: 'POST',
  //     body: urlParams,
  //   })

  //   const apiData = (await response.json()) as GetReportsResponse

  //   return apiData
  // }
}
