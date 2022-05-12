import { Menu } from '@grammyjs/menu'
import { InlineKeyboard } from 'grammy'
import { CustomContext } from '../context'
import { Routes } from '../routes'

export const selectStickersMenuDone = new Menu<CustomContext>(
  'select_stickers_menu_done',
).text('Це все', async (ctx) => {
  const logger = ctx.logger.child({ name: 'selectStickersMenuDone' })

  // get session
  const session = await ctx.session
  session.route = Routes.ConfirmStickers
  logger.debug('got session', { session })

  // create sticker pack
  const stickerSetName = await ctx.services.TelegramStickers.CreateStickerSet(
    ctx,
    Object.values(session.stickers!),
  )
  logger.debug('created sticker pack', { stickerPackName: stickerSetName })

  // create keyboard with a link to sticker set
  const keyboardWithLinkToStickerSet = new InlineKeyboard()
    .url('Твої стікери', `https://t.me/addstickers/${stickerSetName}`)
    .row()
    .text('Все супер, підтверджую')
    .row()
    .text('Я помилився, давай спочатку')
    .row()

  // ask user to confirm stickers
  await ctx.reply(`Я зібрав усі стікери у пак — перевір, чи все в порядку 😎`, {
    reply_markup: keyboardWithLinkToStickerSet,
  })
})
