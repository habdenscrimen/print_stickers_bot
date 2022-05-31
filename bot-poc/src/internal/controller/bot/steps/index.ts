/* eslint-disable max-classes-per-file */

import { Router } from '@grammyjs/router'
import { BotContext } from '../context'
import { StepsBuilder } from '../core/step-builder'
import { stepsList } from './steps'
import { MainMenuStep } from './main-menu/step'
import { SelectStickersStep } from './select-stickers/step'

const router = new Router<BotContext>(async (ctx) => {
  const session = await ctx.session
  return session.route
})

const stepsBuilder = new StepsBuilder({ router, stepsList })

stepsBuilder.add('main-menu', MainMenuStep)
stepsBuilder.add('select-stickers', SelectStickersStep)

export const steps = stepsBuilder.build()
