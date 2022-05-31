/* eslint-disable max-classes-per-file */

import { Router } from '@grammyjs/router'
import { Middleware } from 'grammy'
import { BotContext } from '../context'
import { Steps } from '../steps/steps'

export interface StepOptions {
  router: Router<BotContext>
  step: Steps
  nextSteps: Array<Steps>
}

export interface Step {
  stepBody: Middleware<BotContext>
}

// export abstract class Step {
//   // constructor() {}

//   abstract step: Middleware<BotContext>
// }

export class BaseStep {
  public stepBody: Middleware<BotContext>

  constructor(public stepOptions: StepOptions) {}

  protected nextStep = async (step: Steps, ctx: BotContext) => {
    const session = await ctx.session
    session.route = step
  }
}
