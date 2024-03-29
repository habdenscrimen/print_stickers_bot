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

const createRefund: API<'CreateRefund'> = async ({ logger, sdk }, [{ amount, orderID }]) => {
  let log = logger.child({ name: 'create-refund-api', amount, order_id: orderID })

  try {
    // // get orders list for last 30 days
    // const reports = await sdk.getReports({
    //   dateFrom: Number(new Date()) - 30 * 24 * 60 * 60 * 1000,
    //   dateTo: Number(new Date()),
    // })
    // // log = log.child({ reports })
    // log.debug(`got reports for last 30 days`)

    // // find order by transaction ID
    // const report = reports.data.find(({ transaction_id }) => transaction_id === transactionID)
    // if (!report) {
    //   throw new Error(`order with transaction ID ${transactionID} not found`)
    // }
    // log = log.child({ report })
    // log.debug(`found transaction report by transaction ID`)

    // create refund
    const refundResponse = await sdk.createRefund({ orderID, amount })
    log = log.child({ refund_response: refundResponse })

    // check if refund created (not waiting for next payments)
    if (refundResponse.err_code === 'payment_err_status') {
      log.debug(`refund not created, waiting for next payments`)
      return { wait_reserve: true }
    }

    // Check if refund created and will be processed by Liqpay automatically once
    // the company's balance will incremented for refunded amount.
    if (refundResponse.wait_amount) {
      log.debug(`successfully refunded, wait for next transactions to be processed by liqpay`)
      return { wait_amount: true }
    }

    // Refund is created and processed.
    log.debug('liqpay refund created')
    return { wait_reserve: false, wait_amount: false }
  } catch (error) {
    log.error(`failed to create liqpay refund: ${error}`)
    throw new Error(`failed to create liqpay refund: ${error}`)
  }
}
