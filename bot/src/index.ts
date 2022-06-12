import { exportFunctions } from 'better-firebase-functions'
import { newConfig } from './config'
import { initFirebase } from './pkg/firebase'

const config = newConfig()

initFirebase(config)

exportFunctions({ __filename, exports })
