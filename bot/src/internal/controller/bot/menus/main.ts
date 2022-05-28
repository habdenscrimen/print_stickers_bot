import { Menu } from '@grammyjs/menu'
import { Ctx } from '.'
import { BotContext } from '..'
import { goLike } from '../../../../pkg/function_exec'
import { OrderStatus, User } from '../../../domain'
import { Routes } from '../routes'

export const mainMenu = new Menu<BotContext>('main')
  .text(`Обрати стікери`, selectStickersButton)
  .row()
  .text(`Реферальна програма`, referralProgramButton)
  .row()
  .submenu(`Мої замовлення`, 'stickers-and-orders')
  .text(`FAQ`, faqButton)
  .row()

const stickersAndOrdersSubmenu = new Menu<BotContext>('stickers-and-orders')
  .text('Мої замовлення', myOrdersButton)
  .text('Мої наліпки', myStickerSetsButton)
  .row()
  .text('Відмінити замовлення', async (ctx) => {
    await ctx.editMessageText(
      `ℹ️ Зверни увагу, що якщо замовлення уже виконується, воно не скасується автоматично. Замість цього створиться запит на скасування, який ми розглянемо.`,
    )
    ctx.menu.nav('confirm-cancel-order')
  })
  .row()
  .back('⬅️ Назад')
  .row()

const confirmCancelOrder = new Menu<BotContext>('confirm-cancel-order')
  .text('❌ Зрозуміло, відмінити замовлення', cancelOrderButton)
  .row()
  .text('⬅️ Назад', async (ctx) => {
    // TODO: update text
    await ctx.editMessageText(`Обери що тебе цікавить`)
    ctx.menu.back()
  })

stickersAndOrdersSubmenu.register(confirmCancelOrder)
mainMenu.register(stickersAndOrdersSubmenu)

const orderStatuses: Record<OrderStatus, string> = {
  payment_pending: '⏳ Очікує оплати',
  confirmed: `✅ Замовлення сплачено`,
  layout_ready: `🖨 Виготовлення`,
  printing: `🖨 Виготовлення`,
  delivery: `🚚 Доставка`,
  completed: `✅ Замовлення виконано`,
  cancellation_pending: `❌ Створений запит на скасування`,
  cancelled: `❌ Замовлення скасовано`,
  refund_failed_wait_reserve: `❌ Замовлення скасовано, створений запит на повернення коштів`,
  refund_success_wait_amount: `❌ Замовлення скасовано, створений запит на повернення коштів`,
  refunded: `❌ Замовлення скасовано, кошти повернуто`,
}

/** Changes route to Select Stickers, asks user to send stickers and shows pricing. */
async function selectStickersButton(ctx: Ctx) {
  let logger = ctx.logger.child({ name: 'main-menu: Select stickers', user_id: ctx.from.id })

  // change route to SelectStickers
  const session = await ctx.session
  session.route = Routes.SelectStickers
  logger.debug('changed route to SelectStickers')

  // create tariffs message
  const tariffsString = Object.entries(ctx.config.tariffs)
    .map(([_, { freeDelivery, stickerCost, stickersMax, stickersMin }]) => {
      const freeDeliveryMessage = freeDelivery ? ` і безкоштовна доставка` : ''

      return `*${stickersMin}-${stickersMax}* стікерів: ${stickerCost} грн/шт${freeDeliveryMessage}\n`
    })
    .join('')

  // create message that informs user they can send stickers
  const message = `Супер! Надішли мені потрібні стікери 🔥\n\nЗверни увагу, що чим більше стікерів ти замовиш, тим нижча буде ціна:\n\n${tariffsString}`
  logger = logger.child({ message })

  // send message with info that user can send stickers now
  await ctx.reply(message, { deletePrevBotMessages: true, parse_mode: 'Markdown' })
  logger.debug('sent message that user can send stickers')
}

/** Gets user's referral code and sends it to user along with referral program instructions. */
async function referralProgramButton(ctx: Ctx) {
  let logger = ctx.logger.child({ name: 'main-menu: Referral program', user_id: ctx.from.id })

  // get user's free stickers count and referral code
  const session = await ctx.session
  const freeStickersCount = session.user!.free_stickers_count
  const referralCode = session.user!.referral_code

  const { freeStickerForInvitedUser } = ctx.config.referral

  // create a message with referral link and referral program instructions
  const message = `Твоє реферальне посилання (натисни щоб скопіювати):\n\`https://t.me/print_stickers_ua_bot?start=${referralCode}\`\n\nКоли хтось зареєструється за цим посиланням і зробить перше замовлення, ви удвох отримаєте по ${freeStickerForInvitedUser} безкоштовних стікера 🔥\n\nЗараз безкоштовних стікерів: ${freeStickersCount}`
  logger = logger.child({ message })

  // send message with referral link
  await ctx.editMessageText(message, { parse_mode: 'Markdown' })
  logger.debug('sent message with referral link')
}

/** Gets active user orders and sends their info (status, delivery address, price) to user. */
async function myOrdersButton(ctx: Ctx) {
  let logger = ctx.logger.child({ name: 'main-menu: My orders', user_id: ctx.from.id })

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
    )
    logger.debug('user has no orders', { userID })
    return
  }

  // create a message with user's orders
  const ordersMessage = userOrders
    .map((order, index) => {
      const title = `#${userOrders.length - index} [Наліпки](https://t.me/addstickers/${
        order.telegram_sticker_set_name
      })`
      const status = `_Статус_: ${orderStatuses[order.status]}`
      const deliveryAddress = `_Адреса доствки_: ${order.delivery_address}`
      const price = `_Ціна (без доставки)_: ${order.stickers_cost} грн`

      return `${title}\n${status}\n${deliveryAddress}\n${price}\n\n`
    })
    .join('\n')

  const message = `Твої замовлення:\n\n${ordersMessage}`
  logger = logger.child({ message })

  // send message with user's orders
  await ctx.editMessageText(message, { parse_mode: 'Markdown' })
  logger.debug('sent message with user orders')
}

async function cancelOrderButton(ctx: Ctx) {
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

    // create a message with user's orders
    const ordersMessage = userOrders
      .map((order, index) => {
        const title = `#${userOrders.length - index} [Наліпки](https://t.me/addstickers/${
          order.telegram_sticker_set_name
        })`
        const status = `_Статус_: ${orderStatuses[order.status]}`
        const deliveryAddress = `_Адреса доствки_: ${order.delivery_address}`
        const price = `_Ціна (без доставки)_: ${order.stickers_cost} грн`

        return `${title}\n${status}\n${deliveryAddress}\n${price}\n\n`
      })
      .join('\n')

    // show `cancel order` message
    await ctx.editMessageText(
      `Ось твої замовлення. Надішли мені номер замовлення, яке хочеш відмінити (наприклад, 1):\n\n${ordersMessage}`,
      { parse_mode: 'Markdown' },
    )
  } catch (error) {
    logger.error(`failed to cancel order: ${error}`)
  }
}

async function myStickerSetsButton(ctx: Ctx) {
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
        `Поки що у тебе немає паків наліпок\nПри замовленні наліпок я створю пак із них, на памʼять 😎`,
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

// TODO: implement
async function faqButton(ctx: Ctx) {
  const logger = ctx.logger.child({ name: 'main-menu: FAQ', user_id: ctx.from.id })

  logger.debug('TODO: send FAQ')

  await ctx.reply('TODO: send FAQ', {
    reply_markup: mainMenu,
    deleteInFuture: true,
    deletePrevBotMessages: true,
  })
}
