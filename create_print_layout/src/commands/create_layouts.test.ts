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
  const { firebaseApp } = initFirebase(config)
  const database = newDatabase(firebaseApp)
  const storage = newStorage()
  const context = newContext({ config, database, logger, storage })

  // init services
  const fileServices = newFileServices(context)
  const imageServices = newImageServices(context, fileServices)
  const layoutServices = newLayoutServices(context, fileServices)

  const services: Services = {
    Image: imageServices,
    File: fileServices,
    Layout: layoutServices,
  }

  t.context = { context, services }
})

test.after((t) => {
  // delete temp files
  t.context.services.File.DeleteTempFileDirectory()
})

// TODO: write automatic tests for checking layouts
test('should create layouts', async (t) => {
  const { context, services } = t.context

  const svgImages = new Array(58)
    .fill(0)
    .map((_, i) => `${__dirname}/__test__/svg_images/${i + 1}.svg`)

  await createLayouts(context, services, svgImages)

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
  await Promise.all(preparedImages)

  t.pass()
})
