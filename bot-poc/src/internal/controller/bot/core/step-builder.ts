import { Router } from '@grammyjs/router'
import { BotContext } from '../context'
import { Steps, StepsList } from '../steps/steps'
import { BaseStep, StepOptions } from './step'

type Constructor<T = BaseStep> = new (options: StepOptions) => T

interface StepsBuilderOptions {
  router: Router<BotContext>
  stepsList: StepsList
}

export class StepsBuilder {
  private steps: Array<BaseStep> = []

  constructor(private options: StepsBuilderOptions) {}

  public add = (stepName: Steps, Step: Constructor) => {
    const { stepsList, router } = this.options

    const nextSteps = stepsList.find(({ name }) => name === stepName)?.nextSteps || []

    const stepInstance = new Step({ step: stepName, nextSteps, router })
    this.steps.push(stepInstance)
  }

  public build = () => {
    this.steps.forEach((stepInstance) => {
      this.options.router.route(stepInstance.stepOptions.step, stepInstance.stepBody)
    })

    return this.options.router

    // console.log(JSON.stringify(composers, null, 2))

    // return composers

    // const composers = this.steps.map((stepInstance) => {
    //   return this.options.router.route(stepInstance.stepOptions.step, stepInstance.stepBody)
    // })

    // console.log(JSON.stringify(composers, null, 2))

    // return composers
  }
}
