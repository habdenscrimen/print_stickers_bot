import { Menu } from '@grammyjs/menu'
import { InlineKeyboard } from 'grammy'
import { CustomContext } from '../../context'
import { Routes } from '../../routes'
import { texts } from '../texts'

export enum MenuDoneCallbackQueries {
  ConfirmStickers = 'confirm_stickers',
  Cancel = 'cancel',
}

const text = texts.menus.selectStickers

export const menuDone = new Menu<CustomContext>('select_stickers_menu_done').text(
  text.finishSelectingStickers,
  async (ctx) => {
    const logger = ctx.logger.child({ name: 'selectStickersMenuDone' })

    try {
      // get session
      const session = await ctx.session
      // FIXME: without this line it does not redirect to `selectStickersComposer.callbackQuery`, and I don't know why
      session.route = Routes.ConfirmStickers
      logger.debug('got session', { session })

      // create sticker pack
      const stickerSetName = await ctx.services.Telegram.CreateStickerSet(
        ctx,
        Object.values(session.stickers!),
      )
      logger.debug('created sticker pack', { stickerPackName: stickerSetName })

      // update sticker set name in session to be able to delete this set later
      session.stickerSetName = stickerSetName

      // create keyboard with a link to sticker set
      const keyboardWithLinkToStickerSet = new InlineKeyboard()
        .url(text.linkToStickerSet, `https://t.me/addstickers/${stickerSetName}`)
        .row()
        .text(text.confirmStickers, MenuDoneCallbackQueries.ConfirmStickers)
        .row()
        .text(text.notConfirmedStickerSet, MenuDoneCallbackQueries.Cancel)
        .row()

      // ask user to confirm stickers
      await ctx.reply(text.stickerSetCreated, {
        reply_markup: keyboardWithLinkToStickerSet,
        deleteInFuture: true,
        deletePrevBotMessages: true,
      })
    } catch (error) {
      logger.error('failed to process menu done', { error })
    }
  },
)
