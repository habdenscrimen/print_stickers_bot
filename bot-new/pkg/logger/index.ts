import { Config, ConfigLogLevel } from 'config'
import pino, { Logger as PinoLogger } from 'pino'
// import pretty from 'pino-pretty'

interface Options {
  config: Config
  level: ConfigLogLevel
}

export const NewLogger = (options: Options) => {
  let logger: PinoLogger

  if (options.config.app.env === 'development') {
    logger = pino({ level: options.level })
  } else {
    logger = pino({ level: options.level })
  }

  logger = logger.child({ config: options.config })

  return logger
}

export type Logger = ReturnType<typeof NewLogger>
