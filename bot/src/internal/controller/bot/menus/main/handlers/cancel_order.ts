import { goToMyOrdersMenu, stickersAndOrdersSubmenu } from '..'
import { MenuHandler } from '../..'
import { goLike } from '../../../../../../pkg/function_exec'
import { User } from '../../../../../domain'
import { Routes } from '../../../routes'

export const cancelOrder: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({ name: 'main-menu: Cancel order', user_id: ctx.from.id })

  try {
    // get active user orders
    const userID = ctx.from.id
    const [userOrders, err] = await goLike(
      ctx.repos.Orders.GetUserOrders(userID, ['cancelled', 'completed', 'refunded']),
    )
    if (err) {
      logger.error('failed to get active user orders', { err })
      return
    }
    logger = logger.child({ userOrders })
    logger.debug('got user orders')

    // check if user has any orders
    if (userOrders.length === 0) {
      // reply with no orders message
      await ctx.editMessageText(
        `У тебе немає активних замовлень. Обери наліпки для створення замовлення 😎`,
        { reply_markup: stickersAndOrdersSubmenu },
      )
      logger.debug('user has no orders', { userID })
      return
    }

    // set route to Cancel Order
    const session = await ctx.session
    session.route = Routes.CancelOrder

    // save user orders to session
    session.user = {
      ...(session.user as User),
      activeOrders: userOrders,
    }

    // create message
    const text = ctx.texts.MainMenu.CancelOrdersList({ orders: userOrders })
    logger = logger.child({ text })
    logger.debug(`created cancel orders list message`)

    // show `cancel order` message
    await ctx.editMessageText(text, {
      parse_mode: 'MarkdownV2',
      reply_markup: goToMyOrdersMenu,
    })
  } catch (error) {
    logger.error(`failed to cancel order: ${error}`)
  }
}
