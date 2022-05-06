import inquirer from 'inquirer'

import {
  countPrintReadyImages,
  createPrintLayouts,
  processConfirmedOrdersImages,
} from './commands'
import { config } from './config'
import firebase from './firebase'
import files from './files'

const { db } = firebase.init()

// create temp files directory
files.createTempFilesDirectory()

enum Commands {
  COUNT_UNPROCESSED_PRINT_READY_IMAGES = 'Count unprocessed print-ready images',
  PROCESS_CONFIRMED_ORDERS_IMAGES = 'Process images of confirmed orders',
  CREATE_PRINT_LAYOUTS = 'Create print layouts',
  // TODO: implement
  DOWNLOAD_PRINT_LAYOUTS = 'Download print layouts',
  EXIT = 'Exit',
}

const run = async (): Promise<void> => {
  const answer: { action: Commands } = await inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'What do you want from me?',
      choices: [
        Commands.COUNT_UNPROCESSED_PRINT_READY_IMAGES,
        Commands.PROCESS_CONFIRMED_ORDERS_IMAGES,
        Commands.CREATE_PRINT_LAYOUTS,
        Commands.EXIT,
      ],
    },
  ])

  if (answer.action === Commands.COUNT_UNPROCESSED_PRINT_READY_IMAGES) {
    const count = await countPrintReadyImages(config, db)

    console.info(`\n🎉 ${count} print-ready images found`)
    return
  }

  if (answer.action === Commands.PROCESS_CONFIRMED_ORDERS_IMAGES) {
    await processConfirmedOrdersImages(config, db)

    console.info('\n🎉 successfully processed confirmed orders')
    return
  }

  if (answer.action === Commands.CREATE_PRINT_LAYOUTS) {
    await createPrintLayouts(config, [])

    console.info('\n🎉 successfully created print layouts')
    return
  }

  console.info('Exit')
}

run()
