import { Menu } from '@grammyjs/menu'
import { Ctx } from '.'
import { BotContext } from '..'
import { goLike } from '../../../../pkg/function_exec'
import { OrderStatus } from '../../../domain'
import { Routes } from '../routes'

export const mainMenu = new Menu<BotContext>('main')
  .text(`Обрати стікери`, selectStickersButton)
  .row()
  .text(`Реферальна програма`, referralProgramButton)
  .row()
  .submenu(`Мої замовлення`, 'stickers-and-orders')
  .text(`FAQ`, faqButton)
  .row()

const stickersAndOrdersSubenu = new Menu<BotContext>('stickers-and-orders')
  .text('Мої замовлення', myOrdersButton)
  .text('Мої наліпки', myStickerSetsButton)
  .row()
  .back('⬅️ Назад')
  .row()

mainMenu.register(stickersAndOrdersSubenu)

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
  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: mainMenu,
    deleteInFuture: true,
    deletePrevBotMessages: true,
  })
  logger.debug('sent message with referral link')
}

/** Gets active user orders and sends their info (status, delivery address, price) to user. */
async function myOrdersButton(ctx: Ctx) {
  let logger = ctx.logger.child({ name: 'main-menu: My orders', user_id: ctx.from.id })

  // get active user orders
  const userID = ctx.from.id
  const [userOrders, err] = await goLike(
    ctx.repos.Orders.GetUserOrders(userID, ['cancelled', 'completed']),
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
    await ctx.reply(`У тебе немає активних замовлень`, {
      reply_markup: mainMenu,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
    logger.debug('user has no orders', { userID })
    return
  }

  const orderStatuses: Record<OrderStatus, string> = {
    payment_pending: '⏳ Очікує оплати',
    confirmed: `✅ Замовлення сплачено`,
    layout_ready: `🖨 Виготовлення`,
    printing: `🖨 Виготовлення`,
    delivery: `🚚 Доставка`,
    completed: `✅ Замовлення виконано`,
    cancelled: `❌ Замовлення скасовано`,
  }

  // create a message with user's orders
  const ordersMessage = userOrders
    .map((order, index) => {
      const title = `#${userOrders.length - index} [Стікери](https://t.me/addstickers/${
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
  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: mainMenu,
    deleteInFuture: true,
    deletePrevBotMessages: true,
  })
  logger.debug('sent message with user orders')
}

async function myStickerSetsButton(ctx: Ctx) {
  let logger = ctx.logger.child({ name: 'main-menu: My stickers', user_id: ctx.from.id })

  try {
    // get user orders
    const userID = ctx.from.id
    logger = logger.child({ userID })

    const [userOrders, err] = await goLike(ctx.repos.Orders.GetUserOrders(userID))
    if (err) {
      logger.error(`failed to get user orders: ${err}`)
      return
    }
    logger = logger.child({ userOrders })
    logger.debug('got user orders')

    // check if user has any orders
    if (userOrders.length === 0) {
      await ctx.reply(
        `Поки що у тебе немає паків наліпок\nПри замовленні наліпок я створю пак із них, на памʼять 😎`,
        { reply_markup: mainMenu, deleteInFuture: true, deletePrevBotMessages: true },
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
    await ctx.reply(`Твої наліпки:\n\n${stickerSetsInline}`, {
      parse_mode: 'Markdown',
      reply_markup: mainMenu,
      deleteInFuture: true,
      deletePrevBotMessages: true,
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
