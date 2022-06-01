import { Menu } from '@grammyjs/menu'
import { Ctx } from '.'
import { BotContext } from '..'
import { goLike } from '../../../../pkg/function_exec'
import { OrderStatus, User } from '../../../domain'
import { Routes } from '../routes'
import {
  activeOrdersListText,
  cancelOrdersListText,
  myOrdersText,
  selectStickersInstructionsText,
  startText,
} from '../texts'

export const mainMenu = new Menu<BotContext>('main')
  .text(`🚀 Замовити наліпки`, selectStickersButton)
  .row()
  .text(`👫 Запросити друзів`, referralProgramButton)
  .row()
  .text(`✉️ Мої замовлення`, goToMyOrders)
  .text(`❓ Питання`, faqButton)
  .row()
  .url(`📚 Про сервіс`, 'https://telegra.ph/Test-05-30-157')
  .row()

const selectStickersSubmenu = new Menu<BotContext>('select-stickers')
  .text('⬅️ Назад', goToMainMenu)
  .row()

const stickersAndOrdersSubmenu = new Menu<BotContext>('stickers-and-orders')
  .text('🚚 Замовлення', myOrdersButton)
  .text('💅 Наліпки', myStickerSetsButton)
  .row()
  .text('❌ Скасувати замовлення', cancelOrderMenuButton)
  .row()
  .text('⬅️ Назад', goToMainMenu)
  .row()

const goToMyOrdersMenu = new Menu<BotContext>('go-to-my-orders')
  .text('⬅️ Назад', goToMyOrders)
  .row()

const confirmCancelOrder = new Menu<BotContext>('confirm-cancel-order')
  .text('❌ Зрозуміло, скасувати замовлення', cancelOrderButton)
  .row()
  .text('⬅️ Назад', async (ctx) => {
    await ctx.editMessageText(myOrdersText.text, { parse_mode: myOrdersText.parseMode })
    ctx.menu.back()
  })

stickersAndOrdersSubmenu.register(confirmCancelOrder)
mainMenu.register(stickersAndOrdersSubmenu)
mainMenu.register(selectStickersSubmenu)
mainMenu.register(goToMyOrdersMenu)

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

async function cancelOrderMenuButton(ctx: Ctx) {
  const logger = ctx.logger.child({
    name: 'select-stickers: Cancel order',
    user_id: ctx.from.id,
  })

  try {
    await ctx.editMessageText(
      `ℹ️ Зверни увагу, що якщо замовлення уже виконується, воно не скасується автоматично. Замість цього створиться запит на скасування, який ми розглянемо.`,
    )
    ctx.menu.nav('confirm-cancel-order')
  } catch (error) {
    logger.error(`failed to navigate to my orders: ${error}`)
  }
}

async function goToMyOrders(ctx: Ctx) {
  const logger = ctx.logger.child({ name: 'select-stickers: My orders', user_id: ctx.from.id })

  try {
    // show message about `My orders` submenu
    await ctx.editMessageText(myOrdersText.text, { parse_mode: myOrdersText.parseMode })

    ctx.menu.nav('stickers-and-orders')
  } catch (error) {
    logger.error(`failed to navigate to my orders: ${error}`)
  }
}

async function goToMainMenu(ctx: Ctx) {
  const logger = ctx.logger.child({ name: 'select-stickers: Go back', user_id: ctx.from.id })

  try {
    // change route to Welcome
    const session = await ctx.session
    session.route = Routes.Welcome
    logger.debug('changed route to Welcome')

    const { text, parseMode } = startText(session.invitedByUserName)
    await ctx.editMessageText(text, { parse_mode: parseMode })
    ctx.menu.back()
  } catch (error) {
    logger.error(`failed to navigate to main menu: ${error}`)
  }
}

/** Changes route to Select Stickers, asks user to send stickers and shows pricing. */
async function selectStickersButton(ctx: Ctx) {
  let logger = ctx.logger.child({ name: 'main-menu: Select stickers', user_id: ctx.from.id })

  // change route to SelectStickers
  const session = await ctx.session
  session.route = Routes.SelectStickers
  logger.debug('changed route to SelectStickers')

  ctx.menu.nav('select-stickers')

  // get fresh user object with updated free stickers count
  const user = await ctx.repos.Users.GetUserByID(ctx.from.id)
  if (!user) {
    logger.error(`failed to get user with id ${ctx.from.id}`)
    throw new Error(`failed to get user with id ${ctx.from.id}`)
  }
  logger = logger.child({ user })

  const freeStickersCount = user.free_stickers_count

  const { parseMode, text } = selectStickersInstructionsText(ctx.config, freeStickersCount)

  // send message with info that user can send stickers now
  await ctx.editMessageText(text, {
    parse_mode: parseMode,
    deleteInFuture: true,
    disable_web_page_preview: true,
  })

  logger.debug('sent message that user can send stickers')
}

/** Gets user's referral code and sends it to user along with referral program instructions. */
async function referralProgramButton(ctx: Ctx) {
  let logger = ctx.logger.child({ name: 'main-menu: Referral program', user_id: ctx.from.id })

  // get user's free stickers count and referral code
  const session = await ctx.session
  const referralCode = session.user!.referral_code

  // get fresh user object with updated free stickers count
  const user = await ctx.repos.Users.GetUserByID(ctx.from.id)
  if (!user) {
    logger.error(`failed to get user with id ${ctx.from.id}`)
    throw new Error(`failed to get user with id ${ctx.from.id}`)
  }
  logger = logger.child({ user })

  const freeStickersCount = user.free_stickers_count

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
    await ctx.editMessageText(`Поки що у тебе немає активних замовлень`)
    logger.debug('user has no orders', { userID })
    return
  }

  // create a message with user's orders
  const message = activeOrdersListText({ orders: userOrders })
  logger = logger.child({ message })

  // send message with user's orders
  await ctx.editMessageText(message.text, { parse_mode: message.parseMode })
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
    const { parseMode, text } = cancelOrdersListText({ orders: userOrders })

    // show `cancel order` message
    await ctx.editMessageText(text, { parse_mode: parseMode, reply_markup: goToMyOrdersMenu })
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
