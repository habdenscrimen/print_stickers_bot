import { UserServices } from '..'
import { addFreeStickersForOrderByReferralCode } from './add_free_stickers_for_order_by_referral_code'

export type UserService<HandlerName extends keyof UserServices> = (
  args: Parameters<UserServices[HandlerName]>,
) => ReturnType<UserServices[HandlerName]>

export const newUserServices = (): UserServices => {
  return {
    AddFreeStickersForOrderByReferralCode: (...args) =>
      addFreeStickersForOrderByReferralCode(args),
  }
}
