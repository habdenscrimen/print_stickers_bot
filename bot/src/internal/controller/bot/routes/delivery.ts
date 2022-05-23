import { Keyboard } from 'grammy'
import { RouteHandler, Routes } from '.'
import { goLike } from '../../../../pkg/function_exec'
import { mainMenu } from '../menus/main'

export const delivery: RouteHandler = (nextRoute) => async (ctx) => {
  let logger = ctx.logger.child({ name: 'delivery-route', user_id: ctx.from!.id })

  // check if message is not text
  if (!ctx.message?.text && !ctx.message?.contact) {
    logger.debug('message is not text')
    await ctx.reply('Будь ласка, напиши дані для доставки', {
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
    return
  }

  // get session
  const session = await ctx.session

  // check if user sent delivery info
  if (ctx.message.text) {
    // get delivery info
    const deliveryInfo = ctx.message.text
    logger = logger.child({ deliveryInfo })
    logger.debug('got delivery info')

    // save delivery info to session
    session.order.deliveryInfo = deliveryInfo
    logger.debug('saved delivery info to session')
  }

  // check if user sent a contact
  if (ctx.message.contact) {
    // get phone number
    const { phone_number } = ctx.message.contact

    // save phone number to session
    session.user!.phone_number = phone_number
    logger.debug('saved phone number to session')

    // save phone number to database
    const [_, err] = await goLike(ctx.repos.Users.UpdateUser(ctx.from!.id, { phone_number }))
    if (err) {
      logger.error(`failed to save phone number to database: ${err}`)
      await ctx.reply('Не вдалося зберегти номер телефону', { reply_markup: mainMenu })
      return
    }
    logger.debug('saved phone number to database')
  }

  // check if contact if not provided
  if (!ctx.message.contact && !session.user?.phone_number) {
    // ask user to send contact
    await ctx.reply(
      `Мені потрібен твій контакт на випадок, якщо знадобляться якісь уточнення по замовленню.\nНомер телефону НЕ розголошується третім особам і НЕ буде використовуватись для відправки рекламних повідомлень`,
      {
        reply_markup: {
          keyboard: new Keyboard().requestContact('Надіслати контакт').build(),
          resize_keyboard: true,
          remove_keyboard: true,
        },
        deleteInFuture: true,
        deletePrevBotMessages: true,
      },
    )
    logger.debug(`asked to send contact`)
    return
  }

  // change route to payment
  session.route = Routes.Payment

  // show payment info with payment options
  await ctx.reply(`TODO: Щодо оплати замовлення...`, {
    deleteInFuture: true,
    deletePrevBotMessages: true,
  })
  logger.debug(`asked to select payment option`)
}
