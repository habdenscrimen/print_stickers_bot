import 'dotenv/config'
import * as functions from 'firebase-functions'

const firebaseConfig = functions.config()

export const config = {
  token: process.env.TOKEN || firebaseConfig.telegrambot.token,
  firebase: {
    functionsRegion: 'europe-central2',
    storageBucket: `gs://print-stickers.appspot.com`,
    databaseURL: `https://print-stickers-default-rtdb.europe-west1.firebasedatabase.app/`,
  },
  stickerCostUAH:
    process.env.STICKER_COST_UAH || firebaseConfig.telegrambot.sticker_cost_uah,
  messages: {
    scenes: {
      start: {
        enter: `Привіт! Надішли мені стікери, які хочеш роздрукувати, а далі я сам 😁`,
        requestContact: ``,
        requestContactNoUsername: ``,
      },
      // TODO: add real text
      requestContact: {
        enterWithUsername: `Мені потрібен контакт або юзернейм`,
        enterWithoutUsername: `Мені обовʼязково потрібен контакт, у тебе немає юзернейму`,
        requestContactButton: `Надати контакт`,
        skipContactButton: `Мені і так ок`,
      },
      selectStickers: {
        enter: `Супер! Надішли мені потрібні стікери`,
        gotSticker: `Отримав ✅ \nПродовжуй надсилати стікери`,
        finish: `Це все`,
        duplicateSticker: `Стікер уже доданий, пропускаю`,
      },
      confirmStickers: {
        enter: `Перевір, чи правильні стікери вибрані`,
        clearStickers: `Я помилився, почати заново`,
        confirmStickers: `Все супер, підтверджую ✅`,
      },
      delivery: {
        enter: (price: number) =>
          `Дякую, сума замовлення (не враховуючи доставку): ${price} грн \nНапиши дані для доставки стікерів Новою Поштою (імʼя, номер телефону, місто і номер відділення/поштомату)`,
        clearStickers: `Я помилився, відмінити замовлення`,
      },
      orderConfirmed: {
        enter: `Супер, прийняв замовлення ✅ \nОчікуй відправку протягом 3 робочих днів`,
        goToStart: `Повернутися на початок`,
      },
      questions: {
        // TODO: add text
        enter: `FAQ 🤔`,
      },
    },
    goBack: `⬅️ Назад`,
    animatedStickersNotSupported: `Наразі анімовані стікери не підтримуються 😔 \nПродовжуй надсилати стікери`,
  },
}

export type Config = typeof config
