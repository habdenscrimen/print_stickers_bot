import { Menu } from '@grammyjs/menu'
import { CustomContext } from '../../context'
import { Order, OrderStatus } from '../../domain'
import { Routes } from '../../routes'
import { withDeleteMessage } from '../../hof'

const orderStatuses: Record<OrderStatus, string> = {
  confirmed: `✅ Замовлення прийнято`,
  layout_ready: `🖨 Виготовлення`,
  printing: `🖨 Виготовлення`,
  delivery: `🚚 Доставка`,
  completed: `✅ Замовлення виконано`,
  cancelled: `❌ Замовлення скасовано`,
}

const createShowOrdersMessage = (orders: Order[]): string => {
  const title = `Твої замовлення:\n`

  const orderMessages = orders.map((order, index) => {
    const title = `#${orders.length - index} [Стікери](https://t.me/addstickers/${
      order.telegram_sticker_set_name
    })`
    const status = `_Статус_: ${orderStatuses[order.status]}`
    const deliveryAddress = `_Адреса доствки_: ${order.delivery_address}`
    const price = `_Ціна (без доставки)_: ${order.stickers_cost} грн`

    return `${title}\n${status}\n${deliveryAddress}\n${price}\n\n`
  })

  return `${title}\n${orderMessages.join('\n')}`
}

export const mainMenu = new Menu<CustomContext>('main_menu')
  .text('Обрати стікери', async (ctx) => {
    const session = await ctx.session
    session.route = Routes.SelectStickers

    await withDeleteMessage(
      ctx,
      (ctx) => ctx.reply(`Супер! Надішли мені потрібні стікери`),
      false,
    )
  })
  .row()
  .text('Мої замовлення', async (ctx) => {
    const logger = ctx.logger.child({ name: 'mainMenu - My Orders' })

    try {
      // get user orders
      const userID = ctx.from.id
      const userOrders = await ctx.database.GetActiveUserOrders(userID)
      logger.debug('got user orders', { userOrders })

      // check if user has any orders
      if (userOrders.length === 0) {
        // delete previous bot's message and reply with no orders message
        await withDeleteMessage(ctx, (ctx) =>
          ctx.reply('Поки у тебе немає активних замовлень', { reply_markup: mainMenu }),
        )
        logger.debug('user has no orders', { userID })
        return
      }

      // create message
      const message = createShowOrdersMessage(userOrders)
      logger.debug('sending user orders message', { message })

      // send message
      await ctx.reply(message, { parse_mode: 'Markdown' })

      // delete previous bot's message and show main menu
      await withDeleteMessage(ctx, (ctx) =>
        ctx.reply('Повертаємось у меню', { reply_markup: mainMenu }),
      )
    } catch (error) {
      logger.error('failed to send user orders info', { error })
    }
  })
  .text('FAQ', async (ctx) => {
    await ctx.reply('Ти нажав на FAQ')
  })
