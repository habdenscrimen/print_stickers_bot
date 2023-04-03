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
      process.env.NODE_ENV === 'production' ? 'stickasybot' : 'development_print_stickers_bot',
    // faqDocURL: `https://print-telegram-stickers.notion.site/22a245fe0495451ca5614150e2f092ee`,
    // supportBotURL: `https://t.me/stickasy_support_bot`,
    adminNotificationsChannelID: -615170844,
  },

  log: {
    level: (process.env.LOG_LEVEL || 'debug') as ConfigLogLevel,
  },

  db: {
    sessionTable: `bot_session`,
  },

  analytics: {
    instagram: {
      pixelID: 805268244181073,
      accessToken: `EAAHjmGZBCgEABAM9jLRJUi5s0sAFs2UBCW3ZCRClZB0piYZB3otyD5dCZBq2xUXcrKvUqIbdsNQNukOVgYb8syXwZCgMIksTVQvTJb9dxdnPpbWfrymo13476EELqSDZAH5JFfhQAGRYHNt4B3wBBs9Gs8d55YcqgN0VZAqrc9rj2qY1MnpEdd4zzUi90FwOFK0ZD`,
    },
    mixpanel: {
      projectToken: process.env.MIXPANEL_PROJECT_TOKEN!,
    },
  },

  promoCodes: [
    // {
    //   code: 'keddr',
    //   discountPercent: 20,
    // },
  ],
})

export type Config = ReturnType<typeof GetConfig>
