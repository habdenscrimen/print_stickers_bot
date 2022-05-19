import pino, { Logger as PinoLogger } from 'pino'

export interface Logger extends PinoLogger {}

export const newLogger = (): Logger => {
  const logger = pino()

  return logger
}
