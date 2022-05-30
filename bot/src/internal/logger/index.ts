import pino, { Logger as PinoLogger } from 'pino'
import pretty from 'pino-pretty'
import { Config } from '../../config'

export interface Logger extends PinoLogger {}

export const newLogger = (config: Config): Logger => {
  const isDev = config.env === 'development'

  let logger: Logger

  if (isDev) {
    logger = pino(
      { level: 'debug' },
      pretty({
        colorize: true,
        ignore: 'pid,hostname,time',
        singleLine: true,
      }),
    )
  } else {
    logger = pino({ level: 'debug' })
  }

  logger = logger.child({ config })

  return logger
}
