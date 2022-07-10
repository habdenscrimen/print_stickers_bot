import { Menu } from '@grammyjs/menu'
import { Composer } from 'grammy'
import { BotContext } from '../context'
import { SessionSteps } from '../session'
import { mainMenu } from './menus/main-menu'
import { editSelectedStickersMenu, messages as selectStickersMessages } from './select-stickers'

const messages = {
  noStickerReceived: `Це не стікер з паку, який створив бот 😉`,
  stickerNotFromSet: `Це не стікер з паку, який створив бот 😉`,
  stickerDeleted: `
✅ Стікер видалений\\.

Якщо хочете видалити ще стікери, просто надішліть їх _\\(зі створеного ботом паку\\)_ 👇
  `,
  allStickersDeleted: `Ви видалили всі стікери із замовлення\\. Повертаємось у головне меню 👇`,
}

const goToEditSelectedStickersMenu = new Menu<BotContext>('go-to-edit-selected-stickers-menu')
  .dynamic(async (ctx, range) => {
    const session = await ctx.session
    const { stickerSetName } = session.order

    range.url(`👁 Переглянути стікери`, `https://t.me/addstickers/${stickerSetName}`).row()
  })
  .text(`⬅️ Назад`, async (ctx) => {
    // set route to delivery
    const session = await ctx.session
    session.step = SessionSteps.ConfirmSelectedStickers

    const orderInfo = await ctx.services.Order.GetOrderInfo({ ctx })
    const message = selectStickersMessages.finishSelectingStickers({
      cost: orderInfo.stickerCost,
      price: orderInfo.price,
      count: orderInfo.stickersCount,
    })

    await ctx.reply(message, { reply_markup: editSelectedStickersMenu })

    // track analytics event
    ctx.analytics.trackEvent('Go to edit selected stickers menu: Go back', ctx.from!.id)
  })

// create composer
export const removeStickersFromOrderComposer = new Composer<BotContext>()

// add menu middleware
removeStickersFromOrderComposer.use(goToEditSelectedStickersMenu)

// checkUpdate checks if this composer should handle incoming update
const checkUpdate = async (ctx: BotContext): Promise<boolean> => {
  const session = await ctx.session

  return session.step === SessionSteps.RemoveStickerFromOrder
}

// composer body
removeStickersFromOrderComposer.use(async (ctx, next) => {
  const handleUpdate = await checkUpdate(ctx)

  if (!handleUpdate) {
    await next()
    return
  }

  let logger = ctx.logger.child({ name: 'remove-stickers-from-order-composer' })

  try {
    // check if sticker was sent
    if (!ctx.message?.sticker) {
      await ctx.reply(messages.noStickerReceived)
      logger.debug(`no sticker received`)

      // track analytics event
      ctx.analytics.trackEvent(
        'Remove stickers from order scene: No sticker received',
        ctx.from!.id,
        { ...(ctx.message || {}) },
      )
      return
    }

    // check if sticker is from the bot's sticker set
    const { sticker } = ctx.message
    const session = await ctx.session
    const { stickerSetName } = session.order

    // get sticker set
    const stickerSet = await ctx.api.getStickerSet(stickerSetName!)
    logger = logger.child({ stickerSet })
    logger.debug('got sticker set')

    const stickerInSessionSticker = stickerSet.stickers.some(
      (setSticker) => setSticker.file_unique_id === sticker.file_unique_id,
    )

    if (!stickerInSessionSticker) {
      await ctx.reply(messages.stickerNotFromSet)
      logger.debug(`sticker not from bot's sticker set`)

      // track analytics event
      ctx.analytics.trackEvent(
        'Remove stickers from order scene: Sticker not from bot set received',
        ctx.from!.id,
      )
      return
    }

    // delete sticker
    await ctx.services.Order.DeleteSticker({ ctx, fileID: sticker.file_id })
    logger.debug(`sticker deleted`)

    // check if there are any stickers in the order
    const stickersInOrder = session.order.stickers.length

    if (stickersInOrder === 0) {
      // set step to MainMenu
      session.step = SessionSteps.MainMenu

      // reply and delete order in parallel
      await Promise.all([
        ctx.reply(messages.allStickersDeleted, { reply_markup: mainMenu }),
        ctx.services.Order.DeleteOrder({ ctx }),
      ])

      logger.debug(`all stickers deleted`)
      return
    }

    await ctx.reply(messages.stickerDeleted, { reply_markup: goToEditSelectedStickersMenu })
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to handle remove-stickers-from-order composer: ${error}`)
  }
})
