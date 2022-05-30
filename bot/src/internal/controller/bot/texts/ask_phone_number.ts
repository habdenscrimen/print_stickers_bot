import { Text } from './text'

export const askPhoneNumberText: Text = {
  text: `
🤙 Ще для відправки замовлення потрібен твій номер телефону.

ℹ️ *Не хвилюйся*
Номер __НЕ__ розголошується третім особам і __НЕ__ буде використовуватися для відправки рекламних повідомлень — ми поважаємо твій час і особистий простір.
`
    .replace(/\(/gm, '\\(')
    .replace(/\)/gm, '\\)')
    .replace(/\./gm, '\\.')
    .replace(/\:/gm, '\\:'),
  parseMode: 'MarkdownV2',
}
