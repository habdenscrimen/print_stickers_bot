import {
  Context,
  APIGatewayProxyResult,
  APIGatewayEvent,
  APIGatewayProxyCallback,
} from 'aws-lambda'
import { GetConfig } from 'config'
import { InitApp } from 'internal/app'

export const dashboardHandler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback,
): Promise<APIGatewayProxyResult> => {
  // validate params
  const params = event.queryStringParameters
  if (!params || !params.type || !params.func) {
    return {
      statusCode: 400,
      body: 'Bad Request. No query parameters',
    }
  }

  // init app
  const config = GetConfig()
  const { lib } = await InitApp(config)

  // @ts-expect-error
  const res = await lib.handle({ func: params.func, type: params.type })

  return {
    statusCode: res.statusCode,
    body: JSON.stringify(res.result),
  }
}
