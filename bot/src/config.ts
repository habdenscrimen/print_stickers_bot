export const newConfig = () => {
  const config = {
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
    priceUAH: {
      delivery: 41,
      stickerUnder6: 18,
      stickerUnder10: 16,
      stickerAfter10: 14,
    },
    freeDeliveryAfterStickersCount: 25,
    telegram: {
      adminNotificationsChatID: -615170844,
    },
    referral: {
      freeStickerForInvitedUser: 3,
    },
  }

  return config
}

export type Config = ReturnType<typeof newConfig>
