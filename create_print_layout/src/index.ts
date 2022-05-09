import { newContext } from './context'
import { countUnprocessedImagesCommand } from './commands'
import { promptCommand, CliCommands } from './cli-prompt'
import { initFirebase } from './firebase'
import { newConfig } from './config'
import { newLogger } from './logger'

const start = async () => {
  const config = newConfig()
  const logger = newLogger()
  const { db, storage } = initFirebase(config)
  const context = newContext({ config, db, logger, storage })

  const command = await promptCommand()

  switch (command) {
    case CliCommands.CountUnprocessedImages:
      return countUnprocessedImagesCommand(context, [])

    default:
      return Promise.resolve()
  }
}

start()
