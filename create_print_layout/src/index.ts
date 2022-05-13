import { newContext } from './context'
import { newCommands } from './commands'
import { promptCommand, CliCommands } from './cli-prompt'
import { initFirebase } from './firebase'
import { newConfig } from './config'
import { newLogger } from './logger'
import { newDatabase } from './database'
import { newStorage } from './storage'
import { Services } from './services'
import { newFileServices } from './services/files'
import { newImageServices } from './services/image'
import { newLayoutServices } from './services/layout'
import { newTelegramServices } from './services/telegram'

const start = async () => {
  const config = newConfig()
  const logger = newLogger()
  initFirebase(config)
  const database = newDatabase()
  const storage = newStorage()
  const context = newContext({ config, database, logger, storage })

  // init services
  const fileServices = newFileServices(context)
  const imageServices = newImageServices(context, fileServices)
  const layoutServices = newLayoutServices(context, fileServices)
  const telegramServices = newTelegramServices(context)

  const services: Services = {
    Image: imageServices,
    File: fileServices,
    Layout: layoutServices,
    Telegram: telegramServices,
  }

  // init commands
  const commands = newCommands(context, services)

  // prompt for command
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
