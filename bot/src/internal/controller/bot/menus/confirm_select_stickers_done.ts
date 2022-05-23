import { Menu } from '@grammyjs/menu'
import { Ctx } from '.'
import { BotContext } from '..'
import { goLike } from '../../../../pkg/function_exec'
import { Routes } from '../routes'
import { confirmStickerSet } from './confirm_sticker_set'
import { mainMenu } from './main'

export const confirmSelectStickersDoneMenu = new Menu<BotContext>(
  'confirm-select-stickers-done',
).text(`Дякую, мені вистачить`, confirmSelectedStickers)

async function confirmSelectedStickers(ctx: Ctx) {
  let logger = ctx.logger.child({
    name: 'confirm-select-stickers-done-menu: Confirm',
    user_id: ctx.from.id,
  })

  // get session
  const session = await ctx.session
  // FIXME: without this line it does not redirect to `selectStickersComposer.callbackQuery`, and I don't know why
  session.route = Routes.Idle
  logger = logger.child({ session })

  // show loader before creating sticker set
  await ctx.reply(`Секунду...`, { deleteInFuture: true, deletePrevBotMessages: true })

  // create sticker set
  // TODO: use goLike
  const [stickerSetName, err] = await ctx.services.Telegram.CreateStickerSet(
    ctx,
    Object.values(session.stickers!),
  )
  if (err || !stickerSetName) {
    logger.error(`failed to create sticker set: ${err}`)
    await ctx.reply(`Не вдалося створити стікер-пак. Спробуйте ще раз.`, {
      deleteInFuture: true,
      deletePrevBotMessages: true,
      reply_markup: mainMenu,
    })
    return
  }
  logger = logger.child({ stickerSetName })
  logger.debug('created sticker set')

  // update sticker set name in session to be able to delete this set later
  session.stickerSetName = stickerSetName

  // ask user to confirm stickers
  const [_, sendMessageErr] = await goLike(
    ctx.reply(`Я зібрав усі обрані стікери у пак — перевір, чи все в порядку 😎`, {
      reply_markup: confirmStickerSet,
      deleteInFuture: true,
      deletePrevBotMessages: true,
    }),
  )
  if (sendMessageErr) {
    logger.error(`failed to send message: ${sendMessageErr}`)
  }
}
