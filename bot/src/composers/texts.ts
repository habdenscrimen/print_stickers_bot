import { OrderStatus } from '../domain'

const orderStatuses: Record<OrderStatus, string> = {
  confirmed: `✅ Замовлення прийнято`,
  layout_ready: `🖨 Виготовлення`,
  printing: `🖨 Виготовлення`,
  delivery: `🚚 Доставка`,
  completed: `✅ Замовлення виконано`,
  cancelled: `❌ Замовлення скасовано`,
}

export const texts = {
  orderStatuses,
  greetingWithMenu: `Привіт!\nНадішли мені стікери, які хочеш роздрукувати, а далі я сам`,
  menus: {
    main: {
      chooseStickers: `Обрати стікери`,
      myOrders: 'Мої замовлення',
      faq: `FAQ`,
      sendStickersAction: `Супер! Надішли мені потрібні стікери`,
      faqAction: `Ти нажав на FAQ`,
      noOrders: `Поки у тебе немає активних замовлень`,
      ordersListGoBackToMenu: `Повертаємось у меню`,
    },
    selectStickers: {
      finishSelectingStickers: `Це все`,
      stickerSetCreated: `Я зібрав усі стікери у пак — перевір, чи все в порядку 😎`,
      linkToStickerSet: `Твої стікери`,
      confirmStickers: `Все супер, підтверджую`,
      notConfirmedStickerSet: `Я помилився, давай спочатку`,
    },
  },
  routes: {
    selectStickers: {
      confirmationMessage: (price: number) =>
        `Дякую, сума замовлення (не враховуючи доставку): ${price} грн \nНапиши дані для доставки стікерів Новою Поштою (імʼя, номер телефону, місто і номер відділення/поштомату) 📤`,
      cancelOrder: `Окей, повертаємось 👌`,
      animatedStickerNotSupported: `Наразі анімовані стікери не підтримуються 😔 \nПродовжуй надсилати стікери`,
      alreadyAddedSticker: `Цей стікер уже додано, пропускаю \nПродовжуй надсилати стікери`,
      stickerReceived: `Отримав ✅ \nПродовжуй надсилати стікери`,
    },
    delivery: {
      orderConfirmed: `Прийняв замовлення, очікуй відправки протягом тижня ✌️`,
      askPhoneNumber: `Мені потрібен твій номер телефону`,
    },
  },
}
