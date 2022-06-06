import { MenuHandler } from '../..'
import { goLike } from '../../../../../../pkg/function_exec'

export const myStickerSets: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({ name: 'main-menu: My stickers', user_id: ctx.from.id })

  try {
    // get user orders
    const userID = ctx.from.id
    logger = logger.child({ userID })

    const [userOrders, err] = await goLike(
      ctx.repos.Orders.GetUserOrders(userID, ['cancelled', 'completed', 'refunded']),
    )
    if (err) {
      logger.error(`failed to get user orders: ${err}`)
      return
    }
    logger = logger.child({ userOrders })
    logger.debug('got user orders')

    // check if user has any orders
    if (userOrders.length === 0) {
      // reply with no orders message
      await ctx.editMessageText(
        `Поки що у тебе немає паків наліпок.\nПри замовленні наліпок я створю пак із них, на памʼять 😎`,
      )
      logger.debug('user has no sticker sets')
      return
    }

    // create sticker sets message
    const stickerSetsInline = userOrders
      .map((order, index) => {
        return `[Пак #${userOrders.length - index}](https://t.me/addstickers/${
          order.telegram_sticker_set_name
        })\n`
      })
      .join('\n')

    // send message with user's stickers sets
    await ctx.editMessageText(`Твої наліпки:\n\n${stickerSetsInline}`, {
      parse_mode: 'Markdown',
    })
  } catch (error) {
    logger.error(`failed to get user stickers: ${error}`)
  }
}
