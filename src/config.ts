import 'dotenv/config'

export const config = {
  filesDirectory: `./files`,
  token: process.env.TOKEN!,
  messages: {
    scenes: {
      start: {
        enter: `Привіт! Надішли мені стікери, які хочеш роздрукувати, а далі я сам 😁`,
      },
      selectStickers: {
        enter: `Надішли мені потрібні стікери`,
        gotSticker: `Отримав ✅ \n Продовжуй надсилати стікери`,
        finish: `Це все`,
      },
      confirmStickers: {
        enter: `Перевір, чи правильні стікери вибрані`,
      },
      questions: {
        enter: `FAQ 🤔`,
      },
    },
    goBack: `⬅️ Назад`,
  },
}

export type Config = typeof config
