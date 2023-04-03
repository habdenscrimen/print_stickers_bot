import { Config } from 'config'
import { NewLib } from 'internal/controller/lib'
import { Repos } from 'internal/repos'
import { newOrderRepo } from 'internal/repos/order'
import { newUserRepo } from 'internal/repos/user'
import { Services } from 'internal/services'
import { newOperationalService } from 'internal/services/operational'
import { NewDbClient } from 'pkg/dynamodb/client'
import { NewLogger } from 'pkg/logger'

export const InitApp = async (config: Config) => {
  const logger = NewLogger({ level: config.log.level, config })

  const dbClient = await NewDbClient({ config })

  // init repos
  const repos: Repos = {
    User: newUserRepo(dbClient),
    Order: newOrderRepo(dbClient),
  }

  // init services
  const operationalService = newOperationalService({ config, logger, repos })

  const services: Services = {
    Operational: operationalService,
  }

  // init lib
  const lib = NewLib({
    config,
    logger,
    services,
  })

  return {
    lib,
  }
}
