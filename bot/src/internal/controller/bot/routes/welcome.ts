import { RouteHandler } from '.'

export const welcome: RouteHandler = (nextRoute) => async (ctx) => {
  console.log('welcome')
}
