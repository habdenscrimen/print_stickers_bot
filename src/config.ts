import 'dotenv/config'

export const config = {
  filesDirectory: `./files`,
  token: process.env.TOKEN!,
}

export type Config = typeof config
