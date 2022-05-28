import 'dotenv/config'

/** 
  All prices are in UAH. For example, price 500 means 500 UAH.
*/
export const newConfig = () => {
  const config = {
    env: process.env.NODE_ENV || 'development',
    database: {
      sessionStorageKey: 'bot_session',
    },
    storage: {
      bucket: `gs://print-stickers.appspot.com`,
      paths: {
        rawImages: 'raw_images',
        printReadyImages: 'print_ready_images',
        printReadyLayouts: 'print_ready_layouts',
      },
    },
    functions: {
      region: process.env.FRBS_FUNCTIONS_REGION!,
    },
    bot: {
      token: process.env.BOT_TOKEN!,
      liqpay: {
        testToken: process.env.BOT_LIQPAY_TEST_TOKEN!,
      },
    },
    payment: {
      liqpay: {
        // publicKey:
        //   process.env.NODE_ENV !== 'production'
        //     ? process.env.LIQPAY_PUBLIC_KEY_TEST
        //     : process.env.LIQPAY_PUBLIC_KEY_PRODUCTION,
        // privateKey:
        //   process.env.NODE_ENV !== 'production'
        //     ? process.env.LIQPAY_PRIVATE_KEY_TEST
        //     : process.env.LIQPAY_PRIVATE_KEY_PRODUCTION,

        // TODO: use production keys in production
        publicKey: process.env.LIQPAY_PUBLIC_KEY_TEST,
        privateKey: process.env.LIQPAY_PRIVATE_KEY_TEST,
        webhookURL:
          process.env.NODE_ENV === 'test'
            ? 'http://127.0.0.1:5001/print-stickers/europe-central2/liqpayWebhook'
            : `https://9957-213-109-232-122.ngrok.io/print-stickers/europe-central2/liqpayWebhook`,
      },
      novaPoshta: {
        maxOrderPriceAllowedWithoutPrepayment: 500,
      },
    },
    tariffs: {
      level_1: {
        stickerCost: 18,
        stickersMin: 0,
        stickersMax: 5,
        freeDelivery: false,
      },
      level_2: {
        stickerCost: 16,
        stickersMin: 6,
        stickersMax: 10,
        freeDelivery: false,
      },
      level_3: {
        stickerCost: 14,
        stickersMin: 11,
        stickersMax: Infinity,
        freeDelivery: false,
      },
      level_4: {
        stickerCost: 14,
        stickersMin: 25,
        stickersMax: Infinity,
        freeDelivery: true,
      },
    },
    notifications: {
      telegram: {
        adminNotificationsChatID: -615170844,
      },
    },
    referral: {
      freeStickerForInvitedUser: 3,
    },
    delivery: {
      cost: 41,
      paybackFixCost: 20,
      paybackPercentCost: 2,
    },
  }

  return config
}

export type Config = ReturnType<typeof newConfig>
