import {
  Context,
  APIGatewayProxyResult,
  APIGatewayEvent,
  APIGatewayProxyCallback,
} from 'aws-lambda'
import { GetConfig } from 'config'
import { webhookCallback } from 'grammy'
import { InitApp } from 'internal/app'

// if development, run bot in long-polling mode
if (process.env.NODE_ENV === 'development') {
  // if (process.env.NODE_ENV === 'production') {
  const config = GetConfig()

  InitApp(config).then(({ bot }) => {
    bot.start().catch((error) => {
      console.error(`Bot start error: ${error}`)
    })
  })
}

export const botWebhookHandler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback,
): Promise<APIGatewayProxyResult> => {
  const config = GetConfig()
  const { bot } = await InitApp(config)

  return webhookCallback(bot, 'aws-lambda')(event, context, callback)
}
