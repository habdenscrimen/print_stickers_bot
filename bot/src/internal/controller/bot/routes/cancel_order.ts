import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { RouteHandler } from '.'
import { orderStatuses } from '../texts/order_statuses'

dayjs.extend(utc)
dayjs.extend(timezone)

export const cancelOrder: RouteHandler = (nextRoute) => async (ctx) => {
  let logger = ctx.logger.child({ name: 'cancel-order-route', user_id: ctx.from!.id })

  try {
    // check if user entered a valid order number
    if (!ctx.message?.text) {
      logger.debug('message is not text')
      await ctx.editMessageText(`Будь ласка, напишіть номер замовлення (наприклад, 1)`)
    }

    // get session
    const session = await ctx.session

    // check if order number is of type number
    const orderNumber = parseInt(ctx.message!.text!, 10)
    if (!Number.isNaN(orderNumber)) {
      logger.debug('order number is a number, show confirmation message')

      // get user orders from session
      const userOrders = session.user?.activeOrders || []
      if (!userOrders.length) {
        logger.debug('user has no orders', { userID: ctx.from!.id })
        await ctx.editMessageText(
          `У Вас немає активних замовлень. Оберіть наліпки для створення замовлення 😎`,
        )
        return
      }

      // check that user entered an order number that exists
      if (orderNumber < 1 || orderNumber > userOrders.length) {
        logger.debug('order number is out of range')
        await ctx.editMessageText(
          `Вказано невірний номер замовлення. Будь ласка, напишіть номер замовлення (наприклад, 1)`,
        )
        return
      }

      // get order from user orders
      const order = userOrders[userOrders.length - orderNumber]
      logger = logger.child({ order })
      logger.debug('got order to delete')

      // save order to delete to session
      session.orderToDelete = order

      // create message with order info
      const title = `💅 [Наліпки](https://t.me/addstickers/${order.telegram_sticker_set_name})`
      const deliveryAddress = `🚚 _Адреса доствки_: ${order.delivery_address}`
      const price = `💰 _Ціна (без доставки)_: ${order.stickers_cost} грн`

      const status = `_Статус_: ${orderStatuses[order.status]}`

      const date = `_Дата створення_: ${dayjs(order.created_at)
        .tz('Europe/Kiev')
        .format('DD.MM.YYYY, HH:mm')}`

      const stickersCount = `_Кількість наліпок_: ${order.telegram_sticker_file_ids.length}`

      const orderInfo = `${title}\n${status}\n${date}\n${stickersCount}\n${deliveryAddress}\n${price}\n\n`
      logger = logger.child({ orderInfo })

      // show confirmation message
      const message =
        order.status === 'confirmed'
          ? `Ви хочете скасувати це замовлення:\n\n${orderInfo}Будь ласка, напишіть причину скасування, і ми скасуємо його.`
          : `Ви хочете скасувати це замовлення:\n\n${orderInfo}Будь ласка, напишіть причину скасування, і ми створимо запит на його скасування.`

      await ctx.reply(message, { parse_mode: 'Markdown', deleteInFuture: true })
      return
    }

    // check if there's order to delete in session
    const { orderToDelete } = session
    if (!orderToDelete) {
      logger.debug('no order to delete in session')
      await ctx.editMessageText(`Будь ласка, напишіть номер замовлення (наприклад, 1)`)
      return
    }

    // show loader
    await ctx.editMessageText(`⏳ Секунду...`, { reply_markup: undefined })

    // handle cancellation request
    await ctx.services.Orders.HandleCancellationRequest(orderToDelete.id!, ctx.message!.text!)
    logger.debug('handled cancellation request')

    // delete order from session
    session.orderToDelete = undefined

    // create success message, depending on order status
    const successMessage =
      orderToDelete.status === 'confirmed'
        ? `✅ Замовлення успішно скасовано\n\nПовертаємось у головне меню 👇`
        : `✅ Запит на скасування замовлення успішно створено\n\nПовертаємось у головне меню 👇`

    // show success message
    await ctx.reply(successMessage, {
      deleteInFuture: true,
      deletePrevBotMessages: true,
      reply_markup: ctx.menus.Main.Main,
    })
  } catch (error) {
    logger.error(`failed to cancel user order: ${error}`)
    await ctx.reply(`❌ На жаль, при скасуванні сталася помилка, спробуй ще раз.`)
  }
}
