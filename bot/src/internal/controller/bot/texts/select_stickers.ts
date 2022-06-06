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
😔 Не вдалося створити пак наліпок, спробуй ще раз.
  `
}

const confirmSelectedStickers: Text<'ConfirmSelectedStickers'> = ({ config }) => {
  return `
Бот зібрав усі обрані тобою наліпки у пак — перевір, чи все в порядку 😎
  `
}

const motivateToSelectMoreStickers: Text<'MotivateToSelectMoreStickers'> = (
  { config },
  [{ orderPrice, stickersCount }],
) => {
  let motivationalText = ``

  if (orderPrice.orderPriceLevel === 'level_1') {
    motivationalText = `
Замов трохи більше наліпок і ціна за одну наліпку зменшиться:
👉 від 6 до 11 — *16* грн/шт
👉 від 11 — *14* грн/шт
🚚 від 25 — безкоштовна доставка

_Наприклад, 5 наліпок коштують *90* грн, а 6 наліпок — *96* грн. Виходить вигідніше 🚀_
`
  }

  if (orderPrice.orderPriceLevel === 'level_2') {
    motivationalText = `
Замов трохи більше наліпок і ціна за одну наліпку зменшиться:
👉 від 11 — *14* грн/шт
🚚 від 25 — безкоштовна доставка

_Наприклад, 10 наліпок коштують *160* грн, а 11 наліпок — *154* грн. Виходить вигідніше 🚀_
`
  }

  if (orderPrice.orderPriceLevel === 'level_3') {
    motivationalText = `
🚚 Нагадую, що при замовленні від 25 наліпок доставка буде безкоштовною.
`
  }

  const { stickerCost } = config.tariffs[orderPrice.orderPriceLevel]
  const { stickersPrice, deliveryPrice } = orderPrice

  const text = `
✅ Обрано *${stickersCount}* наліпок за ціною *${stickerCost}* грн/шт${
    orderPrice.freeStickersUsed > 0
      ? `, з них *${orderPrice.freeStickersUsed}* наліпок безкоштовні (залишилось *${orderPrice.freeStickersLeft}* безкоштовних наліпок).`
      : '.'
  }

Сума замовлення *${stickersPrice}* грн. при вартості доставки *${deliveryPrice}* грн.
${motivationalText}
Щоб додати наліпки, просто продовжуй їх надсилати 👇
`

  return text
}
