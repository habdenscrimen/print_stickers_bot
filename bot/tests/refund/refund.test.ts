import { newTestApp } from '../test-app'
import { stickersData } from './fixtures'

const { test, bot, interceptApi, liqpayWebhooks } = newTestApp()

test.before(async () => {
  interceptApi()

  await bot.init()
})

test('should create refund', async (t) => {
  // start bot, should display main menu
  await t.notThrowsAsync(bot.sendCommand('start'))
  t.is(bot.getInlineButtons().length, 4)
  t.is(bot.getInlineButtons()[0].text, 'Обрати стікери')
  t.is(bot.getInlineButtons()[1].text, 'Реферальна програма')
  t.is(bot.getInlineButtons()[2].text, 'Мої замовлення')
  t.is(bot.getInlineButtons()[3].text, 'FAQ')

  // click on `Обрати стікери`
  await t.notThrowsAsync(bot.clickInlineButton(bot.getInlineButtons()[0].text))
  t.true(bot.getText().startsWith('Супер! Надішли мені потрібні стікери'))

  // send stickers
  await t.notThrowsAsync(bot.sendSticker(stickersData[0]))
  t.true(bot.getText().startsWith(`Отримав (всього 1) ✅`))
  t.is(bot.getInlineButtons().length, 1)
  t.is(bot.getInlineButtons()[0].text, 'Це все')

  await t.notThrowsAsync(bot.sendSticker(stickersData[1]))
  t.true(bot.getText().startsWith(`Отримав (всього 2) ✅`))
  t.is(bot.getInlineButtons().length, 1)
  t.is(bot.getInlineButtons()[0].text, 'Це все')

  await t.notThrowsAsync(bot.sendSticker(stickersData[2]))
  t.true(bot.getText().startsWith(`Отримав (всього 3) ✅`))
  t.is(bot.getInlineButtons().length, 1)
  t.is(bot.getInlineButtons()[0].text, 'Це все')

  // click on `Це все`
  await t.notThrowsAsync(bot.clickInlineButton(bot.getInlineButtons()[0].text))
  t.true(bot.getText().startsWith('Обрано *3* стікерів'))
  t.is(bot.getInlineButtons().length, 1)
  t.is(bot.getInlineButtons()[0].text, 'Дякую, мені вистачить')

  // click on `Дякую, мені вистачить`
  await t.notThrowsAsync(bot.clickInlineButton(bot.getInlineButtons()[0].text))
  t.true(
    bot
      .getText()
      .startsWith('Я зібрав усі обрані стікери у пак — перевір, чи все в порядку 😎'),
  )
  t.is(bot.getInlineButtons().length, 3)
  t.is(bot.getInlineButtons()[0].text, 'Мої стікери')
  t.is(bot.getInlineButtons()[1].text, 'Все супер, підтверджую')
  t.is(bot.getInlineButtons()[2].text, 'Я помилився, давай спочатку')

  // click on `Все супер, підтверджую`
  await t.notThrowsAsync(bot.clickInlineButton(bot.getInlineButtons()[1].text))
  t.true(bot.getText().startsWith('Сума замовлення'))
  t.true(bot.getText().includes('Напиши дані для доставки стікерів Новою Поштою'))

  // send delivery address
  await t.notThrowsAsync(bot.sendMessage('Місто Київ'))
  t.is(bot.getButtons().length, 1)
  t.is(bot.getButtons()[0].text, 'Надіслати контакт')

  // send contact
  await t.notThrowsAsync(bot.sendContact())
  t.true(bot.getText().startsWith('Обери спосіб оплати'))
  t.is(bot.getInlineButtons().length, 1)
  t.is(bot.getInlineButtons()[0].text, '1️⃣ Оплатити за допомогою бота')

  // click on `Оплатити за допомогою бота`
  await t.notThrowsAsync(bot.clickInlineButton(bot.getInlineButtons()[0].text))
  t.true(bot.getText().startsWith('Створив платіж, тисни на кнопку оплати 👇'))
  t.not(bot.getInvoice(), null)
  t.is(bot.getInvoice()!.title, 'Наліпки')
  t.true(bot.getInvoice()!.description!.endsWith('надрукованих наліпок'))
  t.not(bot.getInvoice()!.payload, undefined)
  t.not(bot.getInvoice()!.provider_token, undefined)
  t.true(bot.getInvoice()!.provider_data?.includes('server_url'))

  const orderID = bot
    .getInvoice()!
    .provider_data!.substring(
      bot.getInvoice()!.provider_data!.indexOf('order_id=') + 9,
      bot.getInvoice()!.provider_data!.lastIndexOf('"}'),
    )

  // click on `Оплатити` (pay invoice)
  await t.notThrowsAsync(bot.sendPreCheckoutQuery())
  // ⚠️ We don't make a real payment, just emulate it. No payment in LiqPay will be created.
  t.not(bot.getPreCheckoutQuery(), null)
  t.not(bot.getPreCheckoutQuery().ok, null)
  t.not(bot.getPreCheckoutQuery().pre_checkout_query_id, null)
  await t.notThrowsAsync(bot.sendSuccessfulPayment())
  t.is(bot.getText(), '✅ Оплата пройшла успішно, замовлення оформлене!')
  t.is(bot.getInlineButtons().length, 4)
  t.is(bot.getInlineButtons()[0].text, 'Обрати стікери')
  t.is(bot.getInlineButtons()[1].text, 'Реферальна програма')
  t.is(bot.getInlineButtons()[2].text, 'Мої замовлення')
  t.is(bot.getInlineButtons()[3].text, 'FAQ')

  // send webhook about successful payment
  await t.notThrowsAsync(liqpayWebhooks.sendSuccessfulPaymentWebhook(orderID))

  // click on `Мої замовлення`
  await t.notThrowsAsync(bot.clickInlineButton(bot.getInlineButtons()[2].text))
  t.is(bot.getInlineButtons().length, 4)
  t.is(bot.getInlineButtons()[0].text, 'Мої замовлення')
  t.is(bot.getInlineButtons()[1].text, 'Мої наліпки')
  t.is(bot.getInlineButtons()[2].text, 'Відмінити замовлення')
  t.is(bot.getInlineButtons()[3].text, '⬅️ Назад')

  // click on `Відмінити замовлення`
  await t.notThrowsAsync(bot.clickInlineButton(bot.getInlineButtons()[2].text))
  t.is(
    bot.getText(),
    'ℹ️ Зверни увагу, що якщо замовлення уже виконується, воно не скасується автоматично. Замість цього створиться запит на скасування, який ми розглянемо.',
  )
  t.is(bot.getInlineButtons().length, 2)
  t.is(bot.getInlineButtons()[0].text, '❌ Зрозуміло, відмінити замовлення')
  t.is(bot.getInlineButtons()[1].text, '⬅️ Назад')

  // click on `❌ Зрозуміло, відмінити замовлення`
  await t.notThrowsAsync(bot.clickInlineButton(bot.getInlineButtons()[0].text))
  t.true(bot.getText().startsWith('Ось твої замовлення'))
  t.true(bot.getText().includes('#1 [Наліпки]'))

  // send order number (1)
  await t.notThrowsAsync(bot.sendMessage('1'))
  t.true(bot.getText().startsWith('Ти хочеш видалити це замовлення:'))
  t.true(
    bot.getText().endsWith('Будь ласка, напиши причину відміни замовлення, і я відміню його.'),
  )

  // send cancelation reason
  await t.notThrowsAsync(bot.sendMessage('Тому що це автоматичний тест!'))
  t.is(bot.getText(), '✅ Замовлення успішно відмінено')
})
