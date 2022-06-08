import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { escapeMarkdown, DeliveryTexts, TextOptions } from '.'

dayjs.extend(utc)
dayjs.extend(timezone)

type Text<TextName extends keyof DeliveryTexts> = (
  options: TextOptions,
  args: Parameters<DeliveryTexts[TextName]>,
) => ReturnType<DeliveryTexts[TextName]>

export const newDeliveryTexts = (options: TextOptions): DeliveryTexts => {
  return {
    AskDeliveryInfo: (...args) => escapeMarkdown(askDeliveryInfo(options, args)),
  }
}

const askDeliveryInfo: Text<'AskDeliveryInfo'> = ({ config }) => {
  return `
🚚 Будь ласка, напишіть дані для доставки наліпок Новою Поштою:

👉 Імʼя отримувача
👉 Місто і номер відділення/поштомату

*Наприклад:*
Прізвище Імʼя По-батькові, м. Місто, відділення 12.

_Не хвилюйтеся щодо формату, пишіть як зручно 😎_
  `
}
