import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { escapeMarkdown, FAQTexts, TextOptions } from '.'

dayjs.extend(utc)
dayjs.extend(timezone)

type Text<TextName extends keyof FAQTexts> = (
  options: TextOptions,
  args: Parameters<FAQTexts[TextName]>,
) => ReturnType<FAQTexts[TextName]>

export const newFAQTexts = (options: TextOptions): FAQTexts => {
  return {
    Title: (...args) => escapeMarkdown(title(options, args)),
    HowLongIsOrderProcessing: (...args) =>
      escapeMarkdown(howLongIsOrderProcessing(options, args)),
    CanCancelOrder: (...args) => escapeMarkdown(canCancelOrder(options, args)),
    AskQuestion: (...args) => escapeMarkdown(askQuestion(options, args)),
    AskQuestionSuccess: (...args) => escapeMarkdown(askQuestionSuccess(options, args)),
  }
}

const title: Text<'Title'> = ({ config }) => {
  return `
👇 Тут Ви можете знайти відповіді на популярні питання або поставити власне питання.
  `
}

const howLongIsOrderProcessing: Text<'HowLongIsOrderProcessing'> = ({ config }) => {
  return `
Замовлення буде виконано до кінця наступного робочого тижня.

ℹ️ Наразі сервіс працює у тестовому режимі, тому можливі затримки, але ми зробимо все для того, щоб Вам не довелося довго чекати.
  `
}

const canCancelOrder: Text<'CanCancelOrder'> = ({ config }) => {
  return `
Звісно!
Ви можете скасувати замовлення, натиснувши "Мої замовлення" -> "Скасувати замовлення" у головному меню.

ℹ️ Зверніть увагу, що замовлення, які уже виконуються або доставляються, не будуть скасовані автоматично — замість цього буде створено запит на скасування, який ми розглянемо.
  `
}

const askQuestion: Text<'AskQuestion'> = ({ config }) => {
  return `
Добре, Ви можете написати своє питання, і ми відповімо на нього найближчим часом.

ℹ️ Наразі сервіс працює у тестовому режимі, тому відповідь може бути не миттєвою.
  `
}

const askQuestionSuccess: Text<'AskQuestionSuccess'> = ({ config }) => {
  return `
✅ Ваше питання було відправлено. Якщо у Вас є ще питання, Ви можете відправити його прямо зараз.

⬅️ Якщо це все, можемо повернутись у меню.
  `
}
