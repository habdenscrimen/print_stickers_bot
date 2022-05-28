import avaTest, { TestFn } from 'ava'
import { Api } from 'grammy'
import { Config, newConfig } from '../../src/config'
import { newApp } from '../../src/internal/app'
import { Repos } from '../../src/internal/repos'
import { Services } from '../../src/internal/services'
import { TestBot } from '../test-bot'
import { TestLiqpayWebhooks } from './liqpay_webhooks'
import { interceptApi } from './http_requests_interceptors'

interface TestApp {
  repos: Repos
  services: Services
  tgApi: Api
  config: Config
  bot: TestBot
  test: TestFn
  interceptApi: typeof interceptApi
  liqpayWebhooks: TestLiqpayWebhooks
}

export const newTestApp = (): TestApp => {
  // create config
  const config = newConfig()

  // init app with test config
  const { repos, services, tgApi, bot } = newApp(config)

  const testBot = new TestBot(bot, tgApi)

  const test = avaTest as TestFn

  const webhooks = new TestLiqpayWebhooks(
    config.payment.liqpay.privateKey!,
    config.payment.liqpay.webhookURL!,
  )

  return {
    config,
    repos,
    services,
    tgApi,
    bot: testBot,
    test,
    interceptApi,
    liqpayWebhooks: webhooks,
  }
}
