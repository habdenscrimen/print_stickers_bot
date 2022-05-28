import { RouteHandler } from '.'
import { mainMenu } from '../menus/main'

export const cancelOrder: RouteHandler = (nextRoute) => async (ctx) => {
  let logger = ctx.logger.child({ name: 'cancel-order-route', user_id: ctx.from!.id })

  try {
    // check if user entered a valid order number
    if (!ctx.message?.text) {
      logger.debug('message is not text')
      await ctx.editMessageText(`Будь ласка, напиши номер замовлення (наприклад, 1)`)
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
        await ctx.editMessageText(
          `У тебе немає активних замовлень. Обери наліпки для створення замовлення 😎`,
        )
        logger.debug('user has no orders', { userID: ctx.from!.id })
      }

      // check that user entered an order number that exists
      if (orderNumber < 1 || orderNumber > userOrders.length) {
        logger.debug('order number is out of range')
        await ctx.editMessageText(
          `Вказано невірний номер замовлення. Будь ласка, напиши номер замовлення (наприклад, 1)`,
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

      const orderInfo = `${title}\n${deliveryAddress}\n${price}\n\n`
      logger = logger.child({ orderInfo })

      // show confirmation message
      const message =
        order.status === 'confirmed'
          ? `Ти хочеш видалити це замовлення:\n\n${orderInfo}Будь ласка, напиши причину відміни замовлення, і я відміню його.`
          : `Ти хочеш видалити це замовлення:\n\n${orderInfo}Будь ласка, напиши причину відміни замовлення, і я створю запит на його відміну.`

      await ctx.reply(message, { parse_mode: 'Markdown' })
      return
    }

    // check if there's order to delete in session
    const { orderToDelete } = session
    if (!orderToDelete) {
      logger.debug('no order to delete in session')
      await ctx.editMessageText(`Будь ласка, напиши номер замовлення (наприклад, 1)`)
      return
    }

    // handle cancellation request
    await ctx.services.Orders.HandleCancellationRequest(orderToDelete.id!, ctx.message!.text!)
    logger.debug('handled cancellation request')

    // delete order from session
    session.orderToDelete = undefined

    // create success message, depending on order status
    const successMessage =
      orderToDelete.status === 'confirmed'
        ? `✅ Замовлення успішно відмінено`
        : `✅ Запит на відміну замовлення успішно створено`

    // show success message
    await ctx.reply(successMessage, {
      deleteInFuture: true,
      deletePrevBotMessages: true,
      reply_markup: mainMenu,
    })
  } catch (error) {
    logger.error(`failed to cancel user order: ${error}`)
    await ctx.reply(`❌ На жаль, при відміні сталася помилка, спробуй ще раз.`)
  }
}
