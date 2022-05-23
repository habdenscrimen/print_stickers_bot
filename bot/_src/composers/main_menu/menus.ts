import { Menu } from '@grammyjs/menu'
import { CustomContext } from '../../context'
import { Order } from '../../domain'
import { Routes } from '../../routes'
import { texts } from '../texts'

const createShowOrdersMessage = (orders: Order[]): string => {
  const title = `Твої замовлення:\n`

  const orderMessages = orders.map((order, index) => {
    const title = `#${orders.length - index} [Стікери](https://t.me/addstickers/${
      order.telegram_sticker_set_name
    })`
    const status = `_Статус_: ${texts.orderStatuses[order.status]}`
    const deliveryAddress = `_Адреса доствки_: ${order.delivery_address}`
    const price = `_Ціна (без доставки)_: ${order.stickers_cost} грн`

    return `${title}\n${status}\n${deliveryAddress}\n${price}\n\n`
  })

  return `${title}\n${orderMessages.join('\n')}`
}

const text = texts.menus.main

export const mainMenu: Menu<CustomContext> = new Menu<CustomContext>('main_menu')
  .text(text.chooseStickers, async (ctx) => {
    const session = await ctx.session
    session.route = Routes.SelectStickers

    await ctx.reply(text.sendStickersAction(ctx.config.freeDeliveryAfterStickersCount), {
      deletePrevBotMessages: true,
      parse_mode: 'Markdown',
    })
  })
  .row()
  .text(text.referralLinkButton, async (ctx) => {
    try {
      const session = await ctx.session

      const freeStickersCount = session.user?.free_stickers_count || 0

      return ctx.reply(text.referralLink(session.user!.referral_code, freeStickersCount), {
        parse_mode: 'Markdown',
        reply_markup: mainMenu,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
    } catch (error) {
      throw new Error(`failed to send referral link message: ${error}`)
    }
  })
  .row()
  .text(text.myOrders, async (ctx) => {
    const logger = ctx.logger.child({ name: 'mainMenu - My Orders' })

    try {
      // get user orders
      const userID = ctx.from.id
      const userOrders = await ctx.database.GetActiveUserOrders(userID)
      logger.debug('got user orders', { userOrders })

      // check if user has any orders
      if (userOrders.length === 0) {
        await ctx.reply(`У тебе немає активних замовлень`, {
          reply_markup: mainMenu,
          deleteInFuture: true,
          deletePrevBotMessages: true,
        })
        logger.debug('user has no orders', { userID })
        return
      }

      // create message
      const message = createShowOrdersMessage(userOrders)
      logger.debug('sending user orders message', { message })

      // send message
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: mainMenu,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
    } catch (error) {
      logger.error('failed to send user orders info', { error })
    }
  })
  .text(text.faq, async (ctx) => {
    await ctx.reply(text.faqAction)
  })
