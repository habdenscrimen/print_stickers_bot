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
        gotSticker: `Отримав ✅ \nПродовжуй надсилати стікери`,
        finish: `Це все`,
      },
      confirmStickers: {
        enter: `Перевір, чи правильні стікери вибрані`,
        clearStickers: `Я помилився, почати заново`,
        confirmStickers: `Все супер, підтверджую ✅`,
      },
      delivery: {
        enter: (price: number) =>
          `Дякую, сума замовлення (не враховуючи доставку): ${price} \n Напиши дані для доставки стікерів Новою Поштою (імʼя, номер телефону, місто і номер відділення/поштомату)`,
        clearStickers: `Я помилився, відмінити замовлення`,
      },
      orderConfirmed: {
        enter: `Дякую, прийняв замовлення ✅ \n Очікуйте відправку протягом 3 робочих днів`,
        goToStart: `Повернутися на початок`,
      },
      questions: {
        enter: `FAQ 🤔`,
      },
    },
    goBack: `⬅️ Назад`,
  },
}

export type Config = typeof config
