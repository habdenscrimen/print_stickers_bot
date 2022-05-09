import { newContext } from './context'
import { newCommands } from './commands'
import { promptCommand, CliCommands } from './cli-prompt'
import { initFirebase } from './firebase'
import { newConfig } from './config'
import { newLogger } from './logger'
import { newDatabase } from './database'
import { newStorage } from './storage'

const start = async () => {
  const config = newConfig()
  const logger = newLogger()
  const { firebaseApp } = initFirebase(config)
  const database = newDatabase(firebaseApp)
  const storage = newStorage()
  const context = newContext({ config, database, logger, storage })
  const commands = newCommands(context)

  const command = await promptCommand()

  switch (command) {
    case CliCommands.CountUnprocessedImages:
      return commands.CountUnprocessedImages()

    case CliCommands.CreateLayouts:
      return commands.CreateLayouts()

    default:
      return Promise.resolve()
  }
}

start()
