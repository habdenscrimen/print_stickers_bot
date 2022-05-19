import { UserService } from '.'

export const addFreeStickersForOrderByReferralCode: UserService<
  'AddFreeStickersForOrderByReferralCode'
> = async ([ctx, currentUserID, invitedByUserID]) => {
  const logger = ctx.logger.child({ name: 'addFreeStickersForOrderByReferralCode' })
  logger.debug({ currentUserID, invitedByUserID })

  try {
    const { freeStickerForInvitedUser } = ctx.config.referral

    // update invited by user stickers count and invited user ids
    await ctx.database.UpdateUser(
      invitedByUserID,
      {},
      {
        incrementFreeStickers: freeStickerForInvitedUser,
        newInvitedUserID: currentUserID,
      },
    )
    logger.debug('updated invited by user', { id: invitedByUserID })

    // update current user's free stickers count
    await ctx.database.UpdateUser(
      currentUserID,
      {},
      { incrementFreeStickers: freeStickerForInvitedUser },
    )
    logger.debug(`updated current user's free stickers count`, { id: currentUserID })
  } catch (error) {
    logger.error('failed to add free stickers for order by referral code', { error })
    throw new Error(`failed to add free stickers for order by referral code: ${error}`)
  }
}
