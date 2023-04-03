import test from 'ava'
import { Repos } from '../../internal/repos'
import { newUserRepo } from '../../internal/repos/user'
import { NewDbClient } from '../../pkg/dynamodb/client'
import { NewLogger } from '../../pkg/logger'
import { newOrderRepo } from '../../internal/repos/order'
import { GetConfig } from '../../config'
import { newOperationalService } from './operational'

test('getData', async (t) => {
  const config = GetConfig()
  const logger = NewLogger({ level: config.log.level, config })

  const dbClient = await NewDbClient({ config })

  // init repos
  const repos: Repos = {
    User: newUserRepo(dbClient),
    Order: newOrderRepo(dbClient),
  }

  const operationalService = newOperationalService({ config, logger, repos })

  const res = await operationalService.GetData()
  console.log(JSON.stringify(res, null, 2))

  t.is(1, 1)
})
