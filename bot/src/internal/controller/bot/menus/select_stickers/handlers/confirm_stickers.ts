import { MenuHandler } from '../..'
import { goLike } from '../../../../../../pkg/function_exec'
import { Routes } from '../../../routes'

export const confirmStickers: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({
    name: 'confirm-sticker-set-menu: Confirm',
    user_id: ctx.from.id,
  })

  // get session
  const session = await ctx.session

  // set route to delivery
  session.route = Routes.Delivery
  logger.debug('set route to delivery')

  // save sticker set to user in database
  const [_, updateUserErr] = await goLike(
    ctx.repos.Users.UpdateUser(
      ctx.from.id,
      {},
      { newTelegramStickerSet: session.order.stickerSetName! },
    ),
  )
  if (updateUserErr) {
    logger.error(`failed to update user: ${updateUserErr}`)
    return
  }
  logger.debug('saved sticker set to user in database')

  // ask user to enter delivery address
  const text = ctx.texts.Delivery.AskDeliveryInfo()
  logger = logger.child({ text })
  logger.debug(`created message`)

  await ctx.editMessageText(text, {
    parse_mode: 'MarkdownV2',
    reply_markup: undefined,
    deleteInFuture: true,
  })
}
