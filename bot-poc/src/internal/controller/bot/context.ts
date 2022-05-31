import { Context, LazySessionFlavor } from 'grammy'
import { Config } from '../../../config'
import { Order, User } from '../../domain'
import { Logger } from '../../logger'
import { Repos } from '../../repos'
import { Services } from '../../services'
import { Steps } from './steps/steps'

interface SessionOrder {
  stickerSetName: string | undefined
  stickers: Record<string, string> | undefined
  invitedByTelegramUserID: number | undefined
  deliveryInfo: string | undefined
}

interface SessionUser extends User {
  activeOrders?: Order[] | undefined
}

export interface BotSessionData {
  route: Steps
  user: SessionUser | undefined
  order: Partial<SessionOrder>
  orderToDelete: Partial<Order> | undefined
}

export interface BotContext extends Context, LazySessionFlavor<BotSessionData> {
  logger: Logger
  config: Config
  services: Services
  repos: Repos
}
