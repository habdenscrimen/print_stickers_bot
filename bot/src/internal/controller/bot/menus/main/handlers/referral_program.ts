import { MenuHandler } from '../..'

export const referralProgram: MenuHandler = async (ctx) => {
  let logger = ctx.logger.child({ name: 'main-menu: Referral program', user_id: ctx.from.id })

  // get user's free stickers count and referral code
  const session = await ctx.session
  const referralCode = session.user!.referral_code

  // get fresh user object with updated free stickers count
  const user = await ctx.repos.Users.GetUserByID(ctx.from.id)
  if (!user) {
    logger.error(`failed to get user with id ${ctx.from.id}`)
    throw new Error(`failed to get user with id ${ctx.from.id}`)
  }
  logger = logger.child({ user })

  const freeStickersCount = user.free_stickers_count

  const { freeStickerForInvitedUser } = ctx.config.referral
  const { username } = ctx.config.bot

  // create a message with referral link and referral program instructions
  const message = `Ваше реферальне посилання (натисніть щоб скопіювати):\n\`https://t.me/${username}?start=${referralCode}\`\n\nКоли хтось зареєструється за цим посиланням і зробить перше замовлення, ви удвох отримаєте по ${freeStickerForInvitedUser} безкоштовних стікера 🔥\n\nЗараз безкоштовних стікерів: ${freeStickersCount}`
  logger = logger.child({ message })

  // send message with referral link
  await ctx.editMessageText(message, { parse_mode: 'Markdown' })
  logger.debug('sent message with referral link')
}
