import { Config } from '../../../../config'
import { Logger } from '../../../logger'
import { PSPApi } from '../../api'
import { LiqpaySDK } from './sdk'

interface LiqpayAPIOptions {
  config: Config
  logger: Logger
}

type API<MethodName extends keyof PSPApi> = (
  options: LiqpayAPIOptions & { sdk: LiqpaySDK },
  args: Parameters<PSPApi[MethodName]>,
) => ReturnType<PSPApi[MethodName]>

export const newLiqpayAPI = (options: LiqpayAPIOptions): PSPApi => {
  const { publicKey, privateKey } = options.config.payment.liqpay
  if (!publicKey || !privateKey) {
    throw new Error('Liqpay API keys are not configured')
  }

  // init sdk
  const sdk = new LiqpaySDK(publicKey, privateKey)

  return {
    CreateRefund: (...args) => createRefund({ ...options, sdk }, args),
  }
}

const createRefund: API<'CreateRefund'> = async ({ logger, sdk }, [transactionID]) => {
  let log = logger.child({ name: 'create-refund-api', transaction_id: transactionID })

  try {
    // get orders list for last 30 days
    const reports = await sdk.getReports({
      dateFrom: Number(new Date()) - 30 * 24 * 60 * 60 * 1000,
      dateTo: Number(new Date()),
    })
    log = log.child({ reports })
    log.debug(`got reports for last 30 days`)

    // find order by transaction ID
    const order = reports.data.find(({ transaction_id }) => transaction_id === transactionID)
    if (!order) {
      throw new Error(`order with transaction ID ${transactionID} not found`)
    }
    log = log.child({ order })

    // TODO: remove hardcoded data
    const refundResponse = await sdk.createRefund({
      orderID: order.order_id,
      amount: order.amount,
    })
    log = log.child({ refund_response: refundResponse })
    log.debug('liqpay refund created')

    console.log({ refundResponse })
  } catch (error) {
    log.error(`failed to create liqpay refund: ${error}`)
    throw new Error(`failed to create liqpay refund: ${error}`)
  }
}
