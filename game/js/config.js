// ============================================================
// [FILE: game/js/config.js]
// Конфигурация ПОД ЗАКАЗЧИКА. Ничего про механику/баланс/физику
// здесь нет — всё это в core/js/config.js.
// Меняется от заказчика к заказчику без правки ядра.
// ============================================================

export const gameConfig = {

  // Ключ localStorage — уникальный для каждого заказчика/игры.
  STORAGE_KEY: 'pizza_catch',

  // Лимит игрока (минуты) и окно сброса (часы).
  PLAY_LIMIT_MINUTES: 5,
  LIMIT_RESET_HOURS: 4,

  // Ассеты заказчика (заменяемые).
  ASSETS: {
    logo:        'game/assets/logo.svg',
    favicon16:   'game/assets/favicon/favicon-16x16.png',
    favicon32:   'game/assets/favicon/favicon-32x32.png',
    appleTouch:  'game/assets/favicon/apple-touch-icon.png',
    goatcounter: 'game/assets/goatcounter/count.js',

    // Опционально: SVG/PNG для ингредиентов по id.
    // Если для id путь не задан — core/render.js рисует
    // процедурную заглушку.
    // ingredients: {
    //   dough:  'game/assets/ingredients/dough.svg',
    //   tomato: 'game/assets/ingredients/tomato.svg',
    // },
    ingredients: {},
  },
};

// Set false for production
export const DEBUG_DISABLE_LIMIT = false;