import { Composer } from 'grammy'
import { CustomContext } from '../context'
import { Routes } from '../routes'

const composer = new Composer<CustomContext>()

composer.command('help', async (ctx) => {
  await ctx.reply('Це відповідь на /help команду.')
})

composer.command('request_contact', async (ctx) => {
  const session = await ctx.session
  session.route = Routes.RequestContact

  await ctx.reply('Перекидую тебе на роут для запиту контакту.')
})

composer.use(async (ctx) => {
  await ctx.reply('Я не розумію такої команди, спробуй /help.')
})

export { composer }
