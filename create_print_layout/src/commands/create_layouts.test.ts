import avaTest, { TestFn } from 'ava'
import fs from 'fs'
import { newConfig } from '../config'
import { Context, newContext } from '../context'
import { newDatabase } from '../database'
import { initFirebase } from '../firebase'
import { newLogger } from '../logger'
import { Services } from '../services'
import { newFileServices } from '../services/files'
import { newImageServices } from '../services/image'
import { newLayoutServices } from '../services/layout'
import { newTelegramServices } from '../services/telegram'
import { newStorage } from '../storage'
import { createLayouts, prepareFileForPrint } from './create_layouts'

const test = avaTest as TestFn<{
  context: Context
  services: Services
}>

test.before((t) => {
  // init context
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

  t.context = { context, services }
})

// test.after((t) => {
//   // delete temp files
//   t.context.services.File.DeleteTempFileDirectory()
// })

// TODO: write automatic tests for checking layouts
test('should create layouts', async (t) => {
  const { context, services } = t.context

  const svgImages = new Array(14)
    .fill(0)
    .map((_, i) => `${__dirname}/__test__/svg_images/${i + 1}.svg`)

  const files = await createLayouts(context, services, svgImages)

  files.filePaths.forEach((filePath) => {
    const randomLayoutsDirectory = `${context.config.localFiles.tempDirectory}/test_layouts`
    services.File.MoveFiles([filePath], randomLayoutsDirectory)
  })

  t.pass()
})

// TODO: write automatic tests for checking images
test('should prepare image for printing', async (t) => {
  const { context, services } = t.context

  const webpImagePaths = new Array(14)
    .fill(0)
    .map((_, i) => `${__dirname}/__test__/webp_images/${i + 1}.webp`)

  const webpImages = webpImagePaths.map((path) => fs.readFileSync(path))

  const preparedImages = webpImages.map((image) =>
    prepareFileForPrint(context, services, image),
  )
  const files = await Promise.all(preparedImages)

  files.forEach((file) => {
    const randomLayoutsDirectory = `${context.config.localFiles.tempDirectory}/test_images`
    services.File.MoveFiles([file.filePath], randomLayoutsDirectory)
  })

  t.pass()
})
