import { Menu } from '@grammyjs/menu'
import { InlineKeyboard } from 'grammy'
import { CustomContext } from '../../context'
import { Routes } from '../../routes'

export enum MenuDoneCallbackQueries {
  ConfirmStickers = 'confirm_stickers',
  Cancel = 'cancel',
}

export const menuDone = new Menu<CustomContext>('select_stickers_menu_done').text(
  'Це все',
  async (ctx) => {
    const logger = ctx.logger.child({ name: 'selectStickersMenuDone' })

    try {
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

      // update sticker set name in session to be able to delete this set later
      session.stickerSetName = stickerSetName

      // create keyboard with a link to sticker set
      const keyboardWithLinkToStickerSet = new InlineKeyboard()
        .url('Твої стікери', `https://t.me/addstickers/${stickerSetName}`)
        .row()
        .text('Все супер, підтверджую', MenuDoneCallbackQueries.ConfirmStickers)
        .row()
        .text('Я помилився, давай спочатку', MenuDoneCallbackQueries.Cancel)
        .row()

      // ask user to confirm stickers
      await ctx.reply(`Я зібрав усі стікери у пак — перевір, чи все в порядку 😎`, {
        reply_markup: keyboardWithLinkToStickerSet,
      })
    } catch (error) {
      logger.error('failed to process menu done', { error })
    }
  },
)
