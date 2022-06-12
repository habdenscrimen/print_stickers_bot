import * as functions from 'firebase-functions'
import { newConfig } from '../config'

const config = newConfig()

export default functions.region(config.functions.region).https.onRequest(async (req, res) => {
  res.status(200).send('ok')
})
