// ============================================================
// [FILE: game/js/config.js]
// Конфигурация ПОД ЗАКАЗЧИКА.
// ============================================================

export const gameConfig = {

  STORAGE_KEY: 'pizza_catch',

  PLAY_LIMIT_MINUTES: 5,
  LIMIT_RESET_HOURS: 4,

  ASSETS: {
    logo:        'game/assets/logo.svg',
    favicon16:   'game/assets/favicon/favicon-16x16.png',
    favicon32:   'game/assets/favicon/favicon-32x32.png',
    appleTouch:  'game/assets/favicon/apple-touch-icon.png',
    goatcounter: 'game/assets/goatcounter/count.js',

    // SVG-ингредиенты (по id). Остальные рисуются процедурно.
    ingredients: {
      egg:  'game/assets/ingredients/egg.svg',
      pork: 'game/assets/ingredients/pork.svg',
      cabbage: 'game/assets/ingredients/cabbage.svg',
      chilli:  'game/assets/ingredients/chilli-pepper.svg',
    },
  },
};

export const DEBUG_DISABLE_LIMIT = true;