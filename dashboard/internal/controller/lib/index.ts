import { Config } from 'config'
import { Services } from 'internal/services'
import { Logger } from 'pkg/logger'
import { operationalGetData } from './operational-get-data'

type HandlerResponse = {
  statusCode: number
  result: unknown
}

interface NewLibOptions {
  config: Config
  logger: Logger
  services: Services
}

export type Handler = (options: NewLibOptions) => Promise<HandlerResponse>

interface HandlerParams {
  type: 'operational' | 'strategic'
  func: 'getOperationalData'
}

const runHandler = (options: NewLibOptions, params: HandlerParams) => {
  const { type, func } = params

  if (type === 'operational') {
    switch (func) {
      case 'getOperationalData':
        return operationalGetData(options)

      default:
        throw new Error(`function is not implemented`)
    }
  }

  if (type === 'strategic') {
    switch (func) {
      default:
        throw new Error(`function is not implemented`)
    }
  }

  throw new Error(`provided type does not exist`)
}

export const NewLib = (options: NewLibOptions) => {
  return {
    handle: async (params: HandlerParams) => {
      return runHandler(options, params)
    },
  }
}
