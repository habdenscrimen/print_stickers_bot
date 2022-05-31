export type Steps = 'main-menu' | 'select-stickers'

export type StepsList = Array<{ name: Steps; nextSteps: Array<Steps> }>

export const stepsList: StepsList = [
  {
    name: 'main-menu',
    nextSteps: ['select-stickers'],
  },
  {
    name: 'select-stickers',
    nextSteps: ['main-menu'],
  },
]
