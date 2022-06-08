import { MenuHandler } from '../..'
import { goLike } from '../../../../../../pkg/function_exec'

export const myOrders: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({ name: 'main-menu: My orders', user_id: ctx.from.id })

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
      await ctx.editMessageText(`Поки що у Вас немає активних замовлень.`)
      logger.debug('user has no orders', { userID })
      return
    }

    // create a message with user's orders
    const text = ctx.texts.MainMenu.ActiveOrdersList({ orders: userOrders })
    logger = logger.child({ text })

    // send message with user's orders
    await ctx.editMessageText(text, { parse_mode: 'MarkdownV2' })
    logger.debug('sent message with user orders')
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to handle my orders menu`)
  }
}
