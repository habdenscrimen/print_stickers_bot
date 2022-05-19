import { createLogger, LoggerOptions, transports, format } from 'winston'

export const newLogger = (options?: LoggerOptions) => {
  const logger = createLogger({
    ...options,
    level: 'debug',
    transports: [new transports.Console()],
    format: format.combine(format.colorize(), format.simple()),
  })

  const asd = 12
  logger.debug(`asd`, { asd })

  return logger
}
