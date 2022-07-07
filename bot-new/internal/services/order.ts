import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import fetch from 'node-fetch'
import CryptoJS from 'crypto-js'
import { Config } from 'config'
import { Repos } from 'internal/repos'
import { Logger } from 'pkg/logger'
import { OrderService } from '.'

interface OrderServiceOptions {
  repos: Repos
  config: Config
  logger: Logger
}

type Service<HandlerName extends keyof OrderService> = (
  options: OrderServiceOptions,
  args: Parameters<OrderService[HandlerName]>,
) => ReturnType<OrderService[HandlerName]>

export const newOrderService = (options: OrderServiceOptions): OrderService => {
  return {
    IsStickerDuplicate: (...args) => isStickerDuplicate(options, args),
    AddSticker: (...args) => addSticker(options, args),
    DeleteSticker: (...args) => deleteSticker(options, args),
    DeleteOrder: (...args) => deleteOrder(options, args),
    GetOrderInfo: (...args) => getOrderInfo(options, args),
    SaveDeliveryInfo: (...args) => saveDeliveryInfo(options, args),
    CreateOrder: (...args) => createOrder(options, args),
  }
}

const isStickerDuplicate: Service<'IsStickerDuplicate'> = async ({ logger }, [{ ctx }]) => {
  let log = logger.child({ name: 'order-isStickerDuplicate' })

  try {
    const { sticker } = ctx.message!

    // get session stickers
    const session = await ctx.session
    const sessionStickers = session.order.stickers

    // check if sticker is in session stickers
    const sessionContainsSticker = sessionStickers.some(
      (sessionSticker) => sessionSticker.sourceFileUniqueID === sticker!.file_unique_id,
    )

    return sessionContainsSticker
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to check whether sticker is duplicate: ${error}`)
    throw new Error(`failed to check whether sticker is duplicate: ${error}`)
  }
}

const addSticker: Service<'AddSticker'> = async ({ logger, repos }, [{ ctx }]) => {
  let log = logger.child({ name: 'order-addSticker' })

  try {
    const { sticker } = ctx.message!

    // check if sticker set for the current order already exists
    const session = await ctx.session
    const stickerSetExists = Boolean(session.order.stickerSetName)

    // if not, create new sticker set
    if (!stickerSetExists) {
      // get user by id
      const userID = ctx.from!.id
      const user = await repos.User.GetUserByID({ userID })
      if (!user) {
        log.error(`user not found`)
        throw new Error(`user not found`)
      }
      log = log.child({ user })
      log.debug(`got user`)

      // create new sticker set with the source sticker as 1st
      const prefix = customAlphabet(lowercase, 20)()
      const stickerSetName = `${prefix}_by_${ctx.config.bot.username}`
      log = log.child({ stickerSetName })
      log.debug(`generated sticker set name`)

      const stickerSetCount = user.telegram_sticker_sets?.length || 0

      await ctx.api.createNewStickerSet(
        userID,
        stickerSetName,
        `Стікаси #${stickerSetCount + 1}`,
        sticker?.emoji || `😆`,
        { png_sticker: sticker?.file_id },
      )
      log.debug(`created new sticker set`)

      // save sticker set name to session
      session.order.stickerSetName = stickerSetName

      // get sticker set
      const stickerSet = await ctx.api.getStickerSet(stickerSetName)
      log = log.child({ stickerSet })
      log.debug('got sticker set')

      // save sticker to session
      session.order.stickers.push({
        sourceFileID: sticker!.file_id,
        sourceFileUniqueID: sticker!.file_unique_id,
        fileUniqueID: stickerSet.stickers[0].file_unique_id,
      })
      log.debug(`added sticker to session`)

      return { stickerSetName }
    }

    // add sticker to sticker set
    const userID = ctx.from!.id
    const stickerSetName = session.order.stickerSetName!

    // avoid `await` to avoid blocking the bot's response
    await ctx.api.addStickerToSet(userID, stickerSetName, sticker?.emoji || `😆`, {
      png_sticker: sticker?.file_id,
    })
    log.debug(`added sticker to sticker set`)

    // get the newly added sticker
    const stickerSet = await ctx.api.getStickerSet(stickerSetName)
    log = log.child({ stickerSet })
    log.debug('got sticker set')

    const lastSticker = stickerSet.stickers[stickerSet.stickers.length - 1]

    // save sticker to session
    session.order.stickers.push({
      sourceFileID: sticker!.file_id,
      sourceFileUniqueID: sticker!.file_unique_id,
      fileUniqueID: lastSticker.file_unique_id,
    })
    log.debug(`added sticker to session`)

    return { stickerSetName }
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to add sticker: ${error}`)
    throw new Error(`failed to add sticker: ${error}`)
  }
}

const deleteSticker: Service<'DeleteSticker'> = async ({ logger }, [{ ctx, fileID }]) => {
  let log = logger.child({ name: 'order-deleteSticker', fileID })

  try {
    // delete sticker from sticker set
    await ctx.api.deleteStickerFromSet(fileID)

    // delete sticker from session order
    const session = await ctx.session
    const stickerUniqueID = ctx.message!.sticker?.file_unique_id

    const newSessionStickers = session.order.stickers.filter(
      (sticker) => sticker.fileUniqueID !== stickerUniqueID,
    )

    session.order.stickers = newSessionStickers
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to delete sticker: ${error}`)
    throw new Error(`failed to delete sticker: ${error}`)
  }
}

const deleteOrder: Service<'DeleteOrder'> = async ({ logger }, [{ ctx }]) => {
  let log = logger.child({ name: 'order-deleteOrder' })

  try {
    const session = await ctx.session
    const { stickerSetName } = session.order

    if (stickerSetName) {
      // get sticker set
      const stickerSet = await ctx.api.getStickerSet(stickerSetName)
      log = log.child({ stickerSet })
      log.debug('got sticker set')

      // delete sticker set
      await Promise.all(
        stickerSet.stickers.map((sticker) => ctx.api.deleteStickerFromSet(sticker.file_id)),
      )
      log.debug('deleted stickers from set')
    }

    // delete order info from session
    session.order = {
      stickers: [],
      stickerSetName: undefined,
      deliveryInfo: undefined,
    }
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to delete order: ${error}`)
    throw new Error(`failed to delete order: ${error}`)
  }
}

const getOrderInfo: Service<'GetOrderInfo'> = async ({ logger }, [{ ctx }]) => {
  let log = logger.child({ name: 'order-getOrderInfo' })

  try {
    const session = await ctx.session
    const sessionStickers = session.order.stickers
    const stickersCount = sessionStickers.length

    // calculate sticker cost
    let stickerCost = 18

    if (stickersCount < 6) {
      stickerCost = 18
    } else if (stickersCount < 11) {
      stickerCost = 16
    } else {
      stickerCost = 14
    }

    // calculate order price
    const orderPrice = stickersCount * stickerCost

    return {
      stickerCost,
      price: orderPrice,
      stickersCount,
    }
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to get order info: ${error}`)
    throw new Error(`failed to get order info: ${error}`)
  }
}

const saveDeliveryInfo: Service<'SaveDeliveryInfo'> = async ({ logger }, [{ ctx }]) => {
  let log = logger.child({ name: 'order-saveDeliveryInfo' })

  try {
    // save delivery info to session
    const session = await ctx.session
    const deliveryInfo = ctx.message!.text

    session.order.deliveryInfo = deliveryInfo
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to get order info: ${error}`)
    throw new Error(`failed to get order info: ${error}`)
  }
}

const createOrder: Service<'CreateOrder'> = async ({ logger, repos, config }, [{ ctx }]) => {
  let log = logger.child({ name: 'order-createOrder' })

  try {
    // create order in database using session info
    const session = await ctx.session

    // get order info
    const orderInfo = await getOrderInfo({ config, logger, repos }, [{ ctx }])

    await repos.Order.CreateOrder({
      order: {
        id: customAlphabet(lowercase, 10)(),
        user_id: ctx.from!.id,
        delivery_address: session.order.deliveryInfo!,
        payment: {
          method: 'nova_poshta',
        },
        stickers_cost: orderInfo.price,
        telegram_sticker_file_ids: session.order.stickers.map(
          (sticker) => sticker.sourceFileID,
        ),
        telegram_sticker_set_name: session.order.stickerSetName!,
      },
    })
    log.debug(`created order`)

    // TODO: send admin notification about new order

    // delete order info from session
    session.order = {
      stickers: [],
      stickerSetName: undefined,
      deliveryInfo: undefined,
    }

    // send facebook purchase event
    await sendFacebookPurchaseEvent({
      config,
      logger,
      paymentAmount: orderInfo.price,
      firstName: ctx.from?.first_name || 'Unknown',
      lastName: ctx.from?.last_name || '-',
    })
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to create order: ${error}`)
    throw new Error(`failed to create order: ${error}`)
  }
}

interface SendFacebookPurchaseEventOptions {
  config: Config
  logger: Logger
  firstName: string
  lastName?: string
  paymentAmount: number
}

// TODO: move to API layer
const sendFacebookPurchaseEvent = async (options: SendFacebookPurchaseEventOptions) => {
  const { accessToken, pixelID } = options.config.analytics.instagram

  let log = options.logger.child({ name: 'order-sendFacebookPurchaseEvent' })

  const body = JSON.stringify({
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.round(Date.now() / 1000),
        action_source: 'other',
        user_data: {
          fn: [CryptoJS.SHA256(options.firstName).toString(CryptoJS.enc.Hex)],
          ln: [CryptoJS.SHA256(options.lastName || '-').toString(CryptoJS.enc.Hex)],
        },
        custom_data: {
          currency: 'UAH',
          value: `${Math.round(options.paymentAmount)}`,
        },
      },
    ],
  })
  log = log.child({ body })
  log.debug('created event body')

  const response = await fetch(
    `https://graph.facebook.com/v14.0/${pixelID}/events?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
  )
  log = log.child({ response })
  log.debug('got response')

  const data = await response.json()
  log = log.child({ data })
  log.debug('parsed response')

  if (!response.ok) {
    log.error(`failed to send facebook purchase event: ${data}`)
  }
}
