import { Handler } from '.'

export const operationalGetData: Handler = async (options) => {
  let logger = options.logger.child({ name: 'operationalGetData' })

  try {
    const data = await options.services.Operational.GetData()
    logger = logger.child({ data })
    logger.debug(`got data`)

    return {
      statusCode: 200,
      result: { data },
    }
  } catch (error) {
    logger = logger.child({ error })
    logger.error(`failed to get operational data`)
    return {
      statusCode: 500,
      result: { error: `${error}` },
    }
  }
}
