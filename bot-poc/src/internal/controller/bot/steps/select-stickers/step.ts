import { Middleware } from 'grammy'
import { BotContext } from '../../context'
import { BaseStep, Step, StepOptions } from '../../core/step'

export class SelectStickersStep extends BaseStep implements Step {
  constructor(private options: StepOptions) {
    super(options)
    super.stepBody = this.stepBody
  }

  public stepBody: Middleware<BotContext> = async (ctx) => {
    try {
      await ctx.reply(`select-stickers step`)

      // // console.log('SelectStickersStep')
      // await this.nextStep('main-menu', ctx)
    } catch (error) {
      console.error(`select-stickers step error: ${error}`)
    }
  }
}
