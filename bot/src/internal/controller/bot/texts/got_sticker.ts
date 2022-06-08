import { Text } from './text'

export const gotStickerText = (stickersCount: number): Text => {
  return {
    text: `
✅ Отримав (всього ${stickersCount})
Продовжуйте надсилати наліпки 👇 
  `,
    parseMode: 'Markdown',
  }
}
