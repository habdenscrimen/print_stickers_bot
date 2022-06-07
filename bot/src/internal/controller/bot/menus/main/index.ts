import { Menu } from '@grammyjs/menu'
import { MainMenus } from '..'
import { BotContext } from '../..'
import { Config } from '../../../../../config'
import { selectStickers } from './handlers/select_stickers'
import { referralProgram } from './handlers/referral_program'
import { myOrders } from './handlers/my_orders'
import { askQuestion, canCancelOrder, faq, howLongIsOrderProcessing } from './handlers/faq'
import { goToMainMenu } from './handlers/go_to_main_menu'
import { myStickerSets } from './handlers/my_stickers_sets'
import { cancelOrder } from './handlers/cancel_order'
import { goToMyOrders } from './handlers/go_to_my_orders'
import { cancelOrderSubmenu } from './handlers/cancel_order_submenu'
import { goToFaqMenu } from './handlers/go_to_faq_menu'

interface MainMenuOptions {
  config: Config
}

export const newMainMenu = (options: MainMenuOptions): MainMenus => {
  if (options.config.features.referralProgram) {
    mainMenu.register(selectStickersSubmenu)
    mainMenu.register(askQuestionSubmenu)
    mainMenu.register(stickersAndOrdersSubmenu)
    mainMenu.register(goToMyOrdersMenu)
    mainMenu.register(faqSubmenu)
    mainMenu.register(goBackToMainMenuSubmenu)

    return {
      Main: mainMenu,
      GoBackToMainMenu: goBackToMainMenuSubmenu,
    }
  }

  mainMenuWithoutReferral.register(selectStickersSubmenu)
  mainMenuWithoutReferral.register(askQuestionSubmenu)
  mainMenuWithoutReferral.register(stickersAndOrdersSubmenu)
  mainMenuWithoutReferral.register(goToMyOrdersMenu)
  mainMenuWithoutReferral.register(faqSubmenu)
  mainMenuWithoutReferral.register(goBackToMainMenuSubmenu)

  return {
    Main: mainMenuWithoutReferral,
    GoBackToMainMenu: goBackToMainMenuSubmenu,
  }
}

const mainMenu = new Menu<BotContext>('main')
  .text(`🚀 Замовити наліпки`, selectStickers)
  .row()
  .text(`👫 Запросити друзів`, referralProgram)
  .row()
  .text(`✉️ Мої замовлення`, goToMyOrders)
  .text(`❓ Питання`, faq)
  .row()
  .url(`📚 Про сервіс`, 'https://telegra.ph/Test-05-30-157')
  .row()

const mainMenuWithoutReferral = new Menu<BotContext>('main-without-referral')
  .text(`🚀 Замовити наліпки`, selectStickers)
  .row()
  .text(`✉️ Мої замовлення`, goToMyOrders)
  .text(`❓ Питання`, faq)
  .row()
  .url(`📚 Про сервіс`, 'https://telegra.ph/Test-05-30-157')
  .row()

const selectStickersSubmenu = new Menu<BotContext>('select-stickers')
  .text('⬅️ Назад', goToMainMenu)
  .row()

const goBackToMainMenuSubmenu = new Menu<BotContext>('go-back-to-main-menu-submenu')
  .text('⬅️ Назад', goToMainMenu)
  .row()

const askQuestionSubmenu = new Menu<BotContext>('ask-question-submenu')
  .text('⬅️ Назад', goToFaqMenu)
  .row()

export const stickersAndOrdersSubmenu = new Menu<BotContext>('stickers-and-orders')
  .text('🚚 Замовлення', myOrders)
  .text('💅 Наліпки', myStickerSets)
  .row()
  .text('❌ Скасувати замовлення', cancelOrderSubmenu)
  .row()
  .text('⬅️ Назад', goToMainMenu)
  .row()

export const goToMyOrdersMenu = new Menu<BotContext>('go-to-my-orders')
  .text('⬅️ Назад', goToMyOrders)
  .row()

const confirmCancelOrder = new Menu<BotContext>('confirm-cancel-order')
  .text('❌ Зрозуміло, скасувати замовлення', cancelOrder)
  .row()
  .text('⬅️ Назад', async (ctx) => {
    const text = ctx.texts.MainMenu.MyOrders()
    await ctx.editMessageText(text, { parse_mode: 'MarkdownV2' })
    ctx.menu.back()
  })

const faqSubmenu = new Menu<BotContext>('faq')
  .text(`⏳ Як швидко виконається замовлення?`, howLongIsOrderProcessing)
  .row()
  .text(`❌ Чи можна скасувати замовлення?`, canCancelOrder)
  .row()
  .text(`✍️ Поставити запитання`, askQuestion)
  .row()
  .text('⬅️ Назад', goToMainMenu)
  .row()

// register submenus
stickersAndOrdersSubmenu.register(confirmCancelOrder)
