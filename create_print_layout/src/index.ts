import inquirer from 'inquirer'

import {
  countPrintReadyImages,
  createPrintLayoutsCommand,
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
  EXIT = 'Exit',
  // TODO: implement
  DOWNLOAD_PRINT_LAYOUTS = 'Download print layouts',
}

/* confirmCreatingLayouts counts print-ready images and asks user to confirm creating layouts. */
const confirmCreatingLayouts = async (): Promise<boolean> => {
  // count print-ready images
  const printReadyImagesCount = await countPrintReadyImages(config, db)

  if (printReadyImagesCount === 0) {
    console.log('No print-ready images found.')
    return false
  }

  // ask user to confirm
  const answer: { confirmed_creating_layouts: boolean } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed_creating_layouts',
      message: `\nThere are ${printReadyImagesCount} print-ready images. Do you want to create print layouts from them?`,
    },
  ])

  return answer.confirmed_creating_layouts
}

const run = async (): Promise<void> => {
  const answer: { action: Commands } = await inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'Select an action',
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
    const confirmed = await confirmCreatingLayouts()

    if (!confirmed) {
      console.info('\nSkipped')
      return
    }

    await createPrintLayoutsCommand(config, db)
    console.info('\n🎉 successfully created print layouts')
  }

  console.info('\nExit')
}

run()
