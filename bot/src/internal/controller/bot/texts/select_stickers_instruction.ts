import { Config } from '../../../../config'
import { Text } from './text'

export const selectStickersInstructionsText = (
  config: Config,
  freeStickersCount: number,
): Text => {
  return {
    text: `
🚀 Супер, надішли потрібні наліпки!
${
  freeStickersCount > 0
    ? `\n🎉 У тебе є *${freeStickersCount}* безкоштовних наліпок за запрошення друзів, їх вартість [автоматично вирахується](https://telegra.ph/Bezkoshtovn%D1%96-nal%D1%96pki-06-01) із суми замовлення.\n`
    : ''
}
ℹ️ Розмір надрукованої наліпки — *4х4* см. Якщо наліпка у Телеграмі менша, то і надрукована відповідно буде меншою.

*Зверни увагу*, що чим більше наліпок ти замовиш, тим нижчою буде ціна:
👉 до 6 — 18 грн/шт
👉 від 6 до 11 — 16 грн/шт
👉 від 11 — 14 грн/шт
🚚 від 25 — безкоштовна доставка

Чекаю наліпки 👇
    `,
    parseMode: 'Markdown',
  }
}
