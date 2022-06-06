import { MenuHandler } from '../..'

export const goToMyOrders: MenuHandler = async (ctx) => {
  const logger = ctx.logger.child({ name: 'select-stickers: My orders', user_id: ctx.from.id })

  try {
    // show message about `My orders` submenu
    const text = ctx.texts.MainMenu.MyOrders()
    await ctx.editMessageText(text, { parse_mode: 'MarkdownV2' })

    ctx.menu.nav('stickers-and-orders')
  } catch (error) {
    logger.error(`failed to navigate to my orders: ${error}`)
  }
}
