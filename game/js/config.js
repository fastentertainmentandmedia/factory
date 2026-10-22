// ============================================================
// [FILE: game/js/config.js]
// Конфигурация под заказчика. Единственное место, где описан
// список ингредиентов, их пути, стартовая группа и размеры.
// ============================================================

export const gameConfig = {

  STORAGE_KEY: 'food_factory',

  PLAY_LIMIT_MINUTES: 5,
  LIMIT_RESET_HOURS: 4,

  ASSETS: {
    logo:        'game/assets/logo.svg',
    favicon16:   'game/assets/favicon/favicon-16x16.png',
    favicon32:   'game/assets/favicon/favicon-32x32.png',
    appleTouch:  'game/assets/favicon/apple-touch-icon.png',
    goatcounter: 'game/assets/goatcounter/count.js',
  },

  // ----------------------------------------------------------
  // ИНГРЕДИЕНТЫ.
  // id — уникальный ключ (обычно имя файла без расширения).
  // src — путь к картинке (SVG/PNG; пропорции любые).
  // fallback — { color, border } для процедурной отрисовки,
  //   если картинка не загрузилась (или src пуст).
  //
  // Как добавить/заменить ингредиент:
  //   1) положить файл в game/assets/ingredients/
  //   2) добавить/изменить запись в этом массиве
  //   Всё. core/ не трогаем.
  // ----------------------------------------------------------
  INGREDIENTS: [
    { id: 'cabbage',       src: 'game/assets/ingredients/cabbage.svg',       fallback: { color: '#8fd07a', border: '#4a8a3a' } },
    { id: 'cheese',        src: 'game/assets/ingredients/cheese.svg',        fallback: { color: '#f7d040', border: '#b09020' } },
    { id: 'chicken',       src: 'game/assets/ingredients/chicken.svg',       fallback: { color: '#f0d0b0', border: '#a09070' } },
    { id: 'chilli-pepper', src: 'game/assets/ingredients/chilli-pepper.svg', fallback: { color: '#d84a3a', border: '#801818' } },
    { id: 'egg',           src: 'game/assets/ingredients/egg.svg',           fallback: { color: '#fff6d6', border: '#e0c060' } },
    { id: 'fish-cake',     src: 'game/assets/ingredients/fish-cake.png',     fallback: { color: '#f5e4d8', border: '#c98a6a' } },
    { id: 'mushroom',      src: 'game/assets/ingredients/mushroom.png',      fallback: { color: '#c8b090', border: '#806040' } },
    { id: 'noodle',        src: 'game/assets/ingredients/noodle.png',        fallback: { color: '#f0e0b8', border: '#b8a060' } },
    { id: 'noodle-1',      src: 'game/assets/ingredients/noodle-1.png',      fallback: { color: '#e8d4a0', border: '#a89050' } },
    { id: 'noodle-2',      src: 'game/assets/ingredients/noodle-2.png',      fallback: { color: '#dcc890', border: '#988040' } },
    { id: 'nori',          src: 'game/assets/ingredients/nori.svg',          fallback: { color: '#2a4a2a', border: '#0a2a0a' } },
    { id: 'pork',          src: 'game/assets/ingredients/pork.png',          fallback: { color: '#f0a0a0', border: '#c06060' } },
    { id: 'shrimp',        src: 'game/assets/ingredients/shrimp.png',        fallback: { color: '#f5a080', border: '#c06040' } },
    { id: 'tofu',          src: 'game/assets/ingredients/tofu.png',          fallback: { color: '#f5f5ea', border: '#c0c0a8' } },
  ],

  // Плохой ингредиент (роль bad === true).
  BAD_INGREDIENT: {
    id: 'danger',
    src: 'game/assets/ingredients/danger.svg',
    fallback: { color: '#806050', border: '#402818' },
  },

  // ----------------------------------------------------------
  // STARTER — обязательная группа: ровно STARTER_COUNT из неё
  // присутствует в каждом рецепте. Порядок в рецепте случайный.
  // ----------------------------------------------------------
  STARTER_GROUP: ['noodle', 'noodle-1', 'noodle-2'],
  STARTER_COUNT: 1,

  // ----------------------------------------------------------
  // Как вписывать картинки в слот size×size:
  //   'contain' — сохранить пропорции (по большей стороне)
  //   'cover'   — заполнить, обрезать
  //   'fill'    — растянуть (искажение)
  // FIT_SCALE — общий множитель размера (1.05 — чуть крупнее)
  // FIT_PADDING — отступ от краёв слота (доля size)
  // FIT_OVERRIDES — индивидуально: { [id]: { fit, scale } }
  // ----------------------------------------------------------
  INGREDIENT_FIT: 'contain',
  INGREDIENT_FIT_SCALE: 1.05,
  INGREDIENT_FIT_PADDING: 0.04,
  INGREDIENT_FIT_OVERRIDES: {
    'chilli-pepper':    { scale: 1.3 },
    'danger': { scale: 1.3 },

  },
};

export const DEBUG_DISABLE_LIMIT = true;