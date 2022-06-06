import { MenuHandler } from '../..'

export const cancelOrderSubmenu: MenuHandler = async (ctx) => {
  const logger = ctx.logger.child({
    name: 'select-stickers: Cancel order',
    user_id: ctx.from.id,
  })

  try {
    await ctx.editMessageText(
      `ℹ️ Зверни увагу, що якщо замовлення уже виконується, воно не скасується автоматично. Замість цього створиться запит на скасування, який ми розглянемо.`,
    )
    ctx.menu.nav('confirm-cancel-order')
  } catch (error) {
    logger.error(`failed to navigate to my orders: ${error}`)
  }
}
