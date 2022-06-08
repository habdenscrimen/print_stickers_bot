import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { escapeMarkdown, SelectStickersTexts, TextOptions } from '.'

dayjs.extend(utc)
dayjs.extend(timezone)

type Text<TextName extends keyof SelectStickersTexts> = (
  options: TextOptions,
  args: Parameters<SelectStickersTexts[TextName]>,
) => ReturnType<SelectStickersTexts[TextName]>

export const newSelectStickersTexts = (options: TextOptions): SelectStickersTexts => {
  return {
    FailedToCreateStickerSet: (...args) =>
      escapeMarkdown(failedToCreateStickerSet(options, args)),
    ConfirmSelectedStickers: (...args) =>
      escapeMarkdown(confirmSelectedStickers(options, args)),
    MotivateToSelectMoreStickers: (...args) =>
      escapeMarkdown(motivateToSelectMoreStickers(options, args)),
  }
}

const failedToCreateStickerSet: Text<'FailedToCreateStickerSet'> = ({ config }) => {
  return `
😔 Не вдалося створити пак наліпок, спробуйте ще раз.
  `
}

const confirmSelectedStickers: Text<'ConfirmSelectedStickers'> = ({ config }) => {
  return `
Ми зібрали усі обрані наліпки у пак — перевірте, чи все в порядку 😎
  `
}

const motivateToSelectMoreStickers: Text<'MotivateToSelectMoreStickers'> = (
  { config },
  [{ orderPrice, stickersCount }],
) => {
  let motivationalText = ``

  if (orderPrice.orderPriceLevel === 'level_1') {
    motivationalText = `
Замовте трохи більше наліпок і ціна за одну наліпку зменшиться:
👉 від 6 до 11 — *16* грн/шт
👉 від 11 — *14* грн/шт
🚚 від 25 — безкоштовна доставка
`
  }

  if (orderPrice.orderPriceLevel === 'level_2') {
    motivationalText = `
Замовте трохи більше наліпок і ціна за одну наліпку зменшиться:
👉 від 11 — *14* грн/шт
🚚 від 25 — безкоштовна доставка
`
  }

  if (orderPrice.orderPriceLevel === 'level_3') {
    motivationalText = `
🚚 Нагадую, що при замовленні від 25 наліпок доставка буде безкоштовною.
`
  }

  const { stickerCost } = config.tariffs[orderPrice.orderPriceLevel]
  const { stickersPrice, codPoshtomatPrice, codPrice } = orderPrice

  const text = `
✅ Обрано *${stickersCount}* наліпок за ціною *${stickerCost}* грн/шт${
    orderPrice.freeStickersUsed > 0
      ? `, з них *${orderPrice.freeStickersUsed}* наліпок безкоштовні (залишилось *${orderPrice.freeStickersLeft}* безкоштовних наліпок).`
      : '.'
  }

Сума замовлення *${stickersPrice}* грн. при вартості доставки *${codPrice}* грн. (*${codPoshtomatPrice}* грн. при доставці у поштомат).
${motivationalText}
Щоб додати наліпки, просто продовжуйте їх надсилати 👇
`

  return text
}
