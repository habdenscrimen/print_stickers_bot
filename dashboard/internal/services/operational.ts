import fetch from 'node-fetch'
import { Config } from 'config'
import { Repos } from 'internal/repos'
import { Logger } from 'pkg/logger'
import { OperationalService, ResponseOrder } from '.'

interface OrderServiceOptions {
  repos: Repos
  config: Config
  logger: Logger
}

type Service<HandlerName extends keyof OperationalService> = (
  options: OrderServiceOptions,
  args: Parameters<OperationalService[HandlerName]>,
) => ReturnType<OperationalService[HandlerName]>

export const newOperationalService = (options: OrderServiceOptions): OperationalService => {
  return {
    GetData: (...args) => getData(options, args),
  }
}

const getTelegramStickerFiles = async (
  options: { config: Config },
  params: { stickerFileIDs: string[] },
): Promise<string[]> => {
  // const botToken = options.config.bot.token
  const botToken = `5471027970:AAFnaJmCmj521eFuGqcoxXM6JWTQ9si7RHc`

  // get file paths
  const { stickerFileIDs } = params

  const filePaths = await Promise.all(
    stickerFileIDs.map(async (fileID) => {
      const requestPath = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileID}`

      const res = await fetch(requestPath)
      const data = (await res.json()) as { result: { file_path: string } }

      return data.result.file_path
    }),
  )

  const stickerFiles = filePaths.map(
    (path) => `https://api.telegram.org/file/bot${botToken}/${path}`,
  )

  return stickerFiles
}

const getData: Service<'GetData'> = async ({ logger, repos, config }) => {
  let log = logger.child({ name: 'user-getUserByID' })

  try {
    // get orders
    const orders = await repos.Order.GetOrders()
    log = log.child({ orders })
    log.debug(`got orders`)

    // get users
    const userIDs = orders.map((order) => order.user_id)
    console.log(userIDs)

    const users = await Promise.all(userIDs.map((userID) => repos.User.GetUserByID({ userID })))
    log = log.child({ users })
    log.debug(`got users`)

    // attach users to orders
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        // find order's user
        const orderUser = users.find((user) => user!.telegram_user_id === order.user_id)

        // get sticker files
        const orderStickerFiles = await getTelegramStickerFiles(
          { config },
          { stickerFileIDs: order.telegram_sticker_file_ids },
        )
        log = log.child({ orderStickerFiles })
        log.debug(`got sticker files`)

        const response: ResponseOrder = {
          ...order,
          user: orderUser!,
          stickerFiles: orderStickerFiles,
        }

        return response
      }),
    )
    log = log.child({ ordersWithUsers })
    log.debug(`got response`)

    return {
      orders: ordersWithUsers,
    }
  } catch (error) {
    log = log.child({ error })
    log.error(`failed to get operational data: ${error}`)
    throw new Error(`failed to get operational data: ${error}`)
  }
}
