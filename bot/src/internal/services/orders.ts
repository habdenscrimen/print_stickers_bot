import { NotificationService, OrdersService, PaymentService, TelegramService } from '.'
import { Config } from '../../config'
import { APIs } from '../api/api'
import { OrderStatus } from '../domain'
import { Logger } from '../logger'
import { Repos } from '../repos'

interface OrdersServiceOptions {
  apis: APIs
  repos: Repos
  config: Config
  logger: Logger
  paymentService: PaymentService
  telegramService: TelegramService
  notificationService: NotificationService
}

type Service<HandlerName extends keyof OrdersService> = (
  options: OrdersServiceOptions,
  args: Parameters<OrdersService[HandlerName]>,
) => ReturnType<OrdersService[HandlerName]>

export const newOrdersService = (options: OrdersServiceOptions): OrdersService => {
  return {
    CalculateOrderPrice: (...args) => calculateOrderPrice(options, args),
    HandleCancellationRequest: (...args) => handleCancellationRequest(options, args),
    AdminCancelOrder: (...args) => adminCancelOrder(options, args),
    CreateOrder: (...args) => createOrder(options, args),
  }
}

const createOrder: Service<'CreateOrder'> = async (options, [order]) => {
  let log = options.logger.child({ name: 'createOrder', order })

  try {
    // create order in database
    const orderID = await options.repos.Orders.CreateOrder(order)
    log.debug(`order created with id ${orderID}`)

    // get free stickers count
    const stickersCount = order.telegram_sticker_file_ids.length
    const orderPrice = await calculateOrderPrice(options, [
      { stickersCount, userID: order.user_id },
    ])
    log = log.child({ order_price: orderPrice })

    // decrement free stickers count
    await options.repos.Users.UpdateUser(order.user_id, {
      free_stickers_count: orderPrice.freeStickersLeft,
    })
    log.debug(`free stickers count decremented`)

    // create notification about successful order if order's status is `confirmed`
    if (order.status === 'confirmed') {
      options.notificationService.AddNotification({
        admin: { event: 'new_order', payload: { orderID } },
      })
      log.debug(`notification about new order created`)
    }

    return orderID
  } catch (error) {
    log.error(`failed to create order: ${error}`)
    throw new Error(`failed to create order: ${error}`)
  }
}

const calculateOrderPrice: Service<'CalculateOrderPrice'> = async (
  { logger, config, repos },
  [{ stickersCount, userID }],
) => {
  let log = logger.child({ name: 'calculateOrderPrice' })
  log = log.child({ stickersCount })

  try {
    // get user from database to get their free stickers count
    const user = await repos.Users.GetUserByID(userID)
    if (!user) {
      log.error(`user not found: ${userID}`)
      throw new Error(`user with id ${userID} not found`)
    }
    log = log.child({ user })

    // get user's free stickers count
    const freeStickersCount = user.free_stickers_count || 0

    let priceLevel: keyof Config['tariffs']

    // find price level by stickers count
    Object.entries(config.tariffs).forEach(([key, value]) => {
      if (stickersCount >= value.stickersMin && stickersCount <= value.stickersMax) {
        priceLevel = key as keyof Config['tariffs']
      }
    })

    // @ts-expect-error
    if (!priceLevel) {
      log.error('failed to find price level', { stickersCount })
      throw new Error('failed to find price level')
    }
    log = log.child({ priceLevel })
    log.debug(`found price level`)

    const price = config.tariffs[priceLevel]
    log = log.child({ price })

    // calculate how much free stickers used
    const freeStickersUsed =
      stickersCount - freeStickersCount <= 0 ? stickersCount : freeStickersCount

    // calculate stickers price
    const stickersPrice =
      price.stickerCost *
      (stickersCount - freeStickersUsed <= 0 ? 0 : stickersCount - freeStickersUsed)
    log = log.child({ stickers_price: stickersPrice })

    // calculate free stickers left
    const freeStickersLeft = freeStickersCount - freeStickersUsed

    // calculate P.O.D. (Pay On Delivery) price
    const codPrice =
      config.delivery.cost +
      config.delivery.paybackFixCost +
      (stickersPrice * config.delivery.paybackPercentCost) / 100
    log = log.child({ cod_price: codPrice })

    // calculate P.O.D. (Pay On Delivery) price for poshtomat
    const codPoshtomatPrice =
      config.delivery.poshtomatCost +
      config.delivery.paybackFixCost +
      (stickersPrice * config.delivery.paybackPercentCost) / 100
    log = log.child({ cod_price: codPrice })

    log.debug('calculated order price')
    return {
      deliveryPrice: config.delivery.cost,
      codPrice,
      codPoshtomatPrice,
      stickersPrice,
      orderPriceLevel: priceLevel,
      freeStickersUsed,
      freeStickersLeft,
    }
  } catch (error) {
    log.error(`failed to calculate order price: ${error}`)
    throw new Error(`failed to calculate order price: ${error}`)
  }
}

const handleCancellationRequest: Service<'HandleCancellationRequest'> = async (
  { logger, paymentService, repos, telegramService, notificationService },
  [orderID, reason],
) => {
  let log = logger.child({ name: 'handleCancellationRequest', order_id: orderID })

  try {
    // get order by id
    const order = await repos.Orders.GetOrder(orderID)
    if (!order) {
      log.error('failed to find order', { orderID })
      return
    }
    log = log.child({ order })

    // check if order status is 'confirmed' (not printing)
    if (order.status === 'confirmed') {
      log.debug('order is confirmed, cancelling order immediately')

      // update order status to 'cancelled'
      await repos.Orders.UpdateOrder(orderID, {
        status: 'cancelled',
        // @ts-expect-error
        'payment.cancellation_reason': reason,
      })
      log.debug('updated order status to cancelled')

      // delete sticker set
      await telegramService.DeleteStickerSet(order.user_id, order.telegram_sticker_set_name)
      log.debug('deleted sticker set')

      // create refund
      await paymentService.CreateRefund(orderID)

      // create admin notification about cancellation
      notificationService.AddNotification({
        admin: { event: 'order_cancelled', payload: { orderID } },
      })
      return
    }

    // order is processing, create cancellation request (and then, handle it manually)
    log.debug('order is processing, creating cancellation request')

    // update order status to 'cancellation_requested'
    await repos.Orders.UpdateOrder(orderID, {
      status: 'cancellation_pending',
      // @ts-expect-error
      'payment.cancellation_reason': reason,
    })
    log.debug('updated order status to cancellation_requested')

    // create admin notification about cancellation request
    notificationService.AddNotification({
      admin: { event: 'order_cancellation_requested', payload: { orderID } },
    })
  } catch (error) {
    log.error(`failed to handle cancellation request: ${error}`)
    throw new Error(`failed to handle cancellation request: ${error}`)
  }
}

const adminCancelOrder: Service<'AdminCancelOrder'> = async (
  { logger, paymentService, repos, telegramService, notificationService },
  [orderID],
) => {
  let log = logger.child({ name: 'adminCancelOrder', order_id: orderID })

  try {
    // get order by id
    const order = await repos.Orders.GetOrder(orderID)
    if (!order) {
      log.error('failed to find order', { orderID })
      return
    }
    log = log.child({ order })
    log.debug('got order')

    // if order status is not one of these, update its status to 'cancelled'
    const excludeStatusesFromUpdating = new Set<OrderStatus>([
      'cancelled',
      'refunded',
      'refund_failed_wait_reserve',
    ])

    if (!excludeStatusesFromUpdating.has(order.status)) {
      await repos.Orders.UpdateOrder(orderID, { status: 'cancelled' })
      log.debug('updated order status to cancelled')
    }

    // delete sticker set
    await telegramService.DeleteStickerSet(order.user_id, order.telegram_sticker_set_name)
    log.debug('deleted sticker set')

    // if order status is not refunded, create refund (it can be refunded if order was cancelled by admin but refund creation failed)
    if (order.status !== 'refunded' && order.payment?.method !== 'nova_poshta') {
      await paymentService.CreateRefund(orderID)
    }

    // send notification that order is cancelled and refund is created
    await notificationService.AddNotification({
      user: {
        event: 'admin_cancelled_order',
        payload: { orderID, telegramChatID: order.user_id },
      },
    })
  } catch (error) {
    log.error(`failed to cancel order as admin: ${error}`)
    throw new Error(`failed to cancel order as admin: ${error}`)
  }
}
