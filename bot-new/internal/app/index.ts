import { Config } from 'config'
import { NewBot } from 'internal/controller/bot'
import { SessionState } from 'internal/controller/bot/session'
import { Repos } from 'internal/repos'
import { newOrderRepo } from 'internal/repos/order'
import { newUserRepo } from 'internal/repos/user'
import { Services } from 'internal/services'
import { newOrderService } from 'internal/services/order'
import { newUserService } from 'internal/services/user'
import { NewDbClient } from 'pkg/dynamodb/client'
import { newStorageAdapter } from 'pkg/dynamodb/storage-adapter'
import { NewLogger } from 'pkg/logger'

export const InitApp = async (config: Config) => {
  const logger = NewLogger({ level: config.log.level, config })

  const dbClient = await NewDbClient({ config })

  const storageAdapter = newStorageAdapter<SessionState>(config, dbClient)

  // init repos
  const repos: Repos = {
    User: newUserRepo(dbClient),
    Order: newOrderRepo(dbClient),
  }

  // init services
  const userService = newUserService({ config, logger, repos })
  const stickerService = newOrderService({ config, logger, repos })

  const services: Services = {
    User: userService,
    Order: stickerService,
  }

  const bot = await NewBot({
    config,
    logger,
    storageAdapter,
    services,
  })

  return {
    bot,
  }
}
