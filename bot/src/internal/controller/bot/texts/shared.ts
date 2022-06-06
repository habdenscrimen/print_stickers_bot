import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { escapeMarkdown, MainMenuTexts, SharedTexts, TextOptions } from '.'

dayjs.extend(utc)
dayjs.extend(timezone)

type Text<TextName extends keyof SharedTexts> = (
  options: TextOptions,
  args: Parameters<SharedTexts[TextName]>,
) => ReturnType<SharedTexts[TextName]>

export const newSharedTexts = (options: TextOptions): SharedTexts => {
  return {
    GoBackToMainMenu: (...args) => escapeMarkdown(goBackToMainMenu(options, args)),
  }
}

const goBackToMainMenu: Text<'GoBackToMainMenu'> = ({ config }) => {
  return `
Добре, повертаємось у головне меню 👇
  `
}
