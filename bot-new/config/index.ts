export type ConfigLogLevel = 'debug' | 'info' | 'warn' | 'error'

type ConfigAppEnv = 'development' | 'production'

export const GetConfig = () => ({
  app: {
    env: (process.env.NODE_ENV || 'development') as ConfigAppEnv,
  },

  bot: {
    token: process.env.BOT_TOKEN!,
    username:
      // process.env.NODE_ENV === 'production' ? 'stickasybot' : 'development_print_stickers_bot',
      process.env.NODE_ENV === 'production' ? 'stickasybot' : 'stickasybot',
    // faqDocURL: `https://print-telegram-stickers.notion.site/22a245fe0495451ca5614150e2f092ee`,
    // supportBotURL: `https://t.me/stickasy_support_bot`,
  },

  log: {
    level: (process.env.LOG_LEVEL || 'debug') as ConfigLogLevel,
  },

  db: {
    sessionTable: `bot_session`,
  },
})

export type Config = ReturnType<typeof GetConfig>
