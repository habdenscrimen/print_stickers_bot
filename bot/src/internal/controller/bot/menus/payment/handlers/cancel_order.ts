import { MenuHandler } from '../..'
import { Routes } from '../../../routes'

export const cancelOrder: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'select-payment-method: Cancel order',
    user_id: ctx.from.id,
  })

  try {
    // get session
    const session = await ctx.session

    // change route to main menu
    session.route = Routes.Welcome

    // delete sticker set
    await ctx.services.Telegram.DeleteStickerSet(ctx.from.id, session.order.stickerSetName!)
    logger.debug('sticker set successfully deleted')

    // clear order from session
    session.order = {}
    logger.debug('cleared order info from session')

    // show success message to user
    const text = ctx.texts.Payment.CanceledOrder()
    logger = logger.child({ text })
    logger.debug(`created message text`)

    await ctx.reply(text, {
      reply_markup: ctx.menus.Main.Main,
      parse_mode: 'MarkdownV2',
      deleteInFuture: true,
      deletePrevBotMessages: true,
    })
    logger.info(`order created`)
  } catch (error) {
    logger.error(`failed to handle payment on nova poshta: ${error}`)
  }
}
