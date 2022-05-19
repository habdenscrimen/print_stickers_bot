import { OrderStatus } from '../domain'
import { OrderPriceLevel } from '../services'

const orderStatuses: Record<OrderStatus, string> = {
  pending_prepayment: '⏳ Очікує передоплати',
  confirmed: `✅ Замовлення прийнято`,
  layout_ready: `🖨 Виготовлення`,
  printing: `🖨 Виготовлення`,
  delivery: `🚚 Доставка`,
  completed: `✅ Замовлення виконано`,
  cancelled: `❌ Замовлення скасовано`,
}

export const texts = {
  orderStatuses,
  greetingWithMenu: (invitedByName?: string) => {
    const invitedMessage = invitedByName
      ? `Тебе запросив(ла) ${invitedByName}. Як тільки ти зробиш перше замовлення, ви удвох отримаєте по 3 безкоштовних стікера 🔥\n\n`
      : ''

    return `Привіт!\n${invitedMessage}Надішли мені стікери, які хочеш роздрукувати, а далі я сам 🚀`
  },
  menus: {
    main: {
      chooseStickers: `Обрати стікери`,
      myOrders: 'Мої замовлення',
      faq: `FAQ`,
      sendStickersAction: (freeDeliveryAfterStickersCount: number) =>
        `Супер! Надішли мені потрібні стікери 🔥\n\nЗверни увагу, що чим більше стікерів ти замовиш, тим нижча буде ціна:\n\n*1-5* стікерів: 18 грн/шт\n*6-10* стікерів: 16 грн/шт\nвід *10* стікерів: 14 грн/шт\nвід *${freeDeliveryAfterStickersCount}* стікерів: 14 грн/шт і безкоштовна доставка`,
      faqAction: `Ти нажав на FAQ`,
      noOrders: `Поки у тебе немає активних замовлень`,
      ordersListGoBackToMenu: `Повертаємось у меню`,
    },
    selectStickers: {
      finishSelectingStickers: `Це все`,
      stickerSetCreated: `Я зібрав усі обрані стікери у пак — перевір, чи все в порядку 😎`,
      linkToStickerSet: `Мої стікери`,
      confirmStickers: `Все супер, підтверджую`,
      notConfirmedStickerSet: `Я помилився, давай спочатку`,
      motivationalMessageToSelectMoreStickers: ({
        stickersCount,
        stickerCost,
        orderPriceLevel,
        freeDeliveryAfterStickersCount,
        stickersPrice,
        deliveryCost,
      }: {
        stickersCount: number
        stickerCost: number
        orderPriceLevel: OrderPriceLevel
        freeDeliveryAfterStickersCount: number
        stickersPrice: number
        deliveryCost: number
      }) => {
        let additionalText = ''

        if (orderPriceLevel === OrderPriceLevel.less_than_6_stickers) {
          additionalText = `\nЗамов трохи більше стікерів і ціна за стікер зменшиться:\n\n*6-10* стікерів: 16 грн/шт\nвід *10* стікерів: 14 грн/шт\nвід *${freeDeliveryAfterStickersCount}* стікерів: 14 грн/шт і безкоштовна доставка`
        } else if (orderPriceLevel === OrderPriceLevel.less_than_10_stickers) {
          additionalText = `\nЗамов трохи більше стікерів і ціна за стікер зменшиться:\n\nвід *10* стікерів: 14 грн/шт\nвід *${freeDeliveryAfterStickersCount}* стікерів: 14 грн/шт і безкоштовна доставка`
        } else if (orderPriceLevel === OrderPriceLevel.more_than_10_stickers) {
          additionalText = `\nЗамов ще ${
            freeDeliveryAfterStickersCount - stickersCount
          } стікерів і доставка вийде безкоштовною`
        } else if (orderPriceLevel === OrderPriceLevel.free_delivery) {
          additionalText = `Також доставка буде безкоштовною`
        }

        return `Обрано *${stickersCount}* стікерів за ціною ${stickerCost} грн/шт (сума замовлення *${stickersPrice}* грн. при вартості доставки *${deliveryCost}* грн.)\n${additionalText}\n\nЩоб додати стікери, просто продовжуй їх надсилати 🚀`
      },
      stopSelectingStickers: `Дякую, мені вистачить`,
    },
  },
  routes: {
    selectStickers: {
      confirmationMessage: ({
        deliveryPrice,
        stickersPrice,
        totalPrice,
        isDeliveryFree,
      }: {
        deliveryPrice: number
        stickersPrice: number
        totalPrice: number
        isDeliveryFree: boolean
      }) => {
        const deliveryPriceText = isDeliveryFree
          ? `доставка безкоштовна`
          : `доставка — ${deliveryPrice} грн`

        const askDeliveryInfo = `Напиши дані для доставки стікерів Новою Поштою (імʼя, номер телефону, місто і номер відділення/поштомату) 📤`

        return `Дякую, сума замовлення — ${stickersPrice} грн, ${deliveryPriceText}, всього — ${totalPrice} грн.\nОплата при отриманні на Новій Пошті.\n\n${askDeliveryInfo}`
      },
      cancelOrder: `Окей, повертаємось 👌`,
      animatedStickerNotSupported: `Наразі анімовані стікери не підтримуються 😔 \nПродовжуй надсилати стікери`,
      alreadyAddedSticker: `Цей стікер уже додано, пропускаю \nПродовжуй надсилати стікери`,
      stickerReceived: (count: number) =>
        `Отримав (всього ${count}) ✅ \nПродовжуй надсилати стікери`,
    },
    delivery: {
      orderConfirmed: `Прийняв замовлення, очікуй відправки протягом тижня ✌️`,
      askPhoneNumber: `Мені потрібен твій номер телефону`,
    },
  },
}
