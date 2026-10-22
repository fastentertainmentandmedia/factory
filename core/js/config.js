// ============================================================
// [FILE: core/js/config.js]
// ============================================================

export const config = {

  MAX_DPR: 2,

  FIELD_ASPECT: 520 / 720,

  LANE_X_RATIOS: [0.20, 0.50, 0.80],

  HUD_TOP_H_RATIO:      0.09,
  HUD_RECIPE_H_RATIO:   0.09,
  HUD_PADDING_RATIO:    0.03,

  CONVEYOR_TOP_RATIO:    0.20,
  CONVEYOR_BOTTOM_RATIO: 0.66,

  ITEM_SIZE_RATIO:        0.11,
  RECIPE_ITEM_SIZE_RATIO: 0.10,
  LANE_WIDTH_RATIO:       0.20,
  TAP_RADIUS_RATIO:       0.12,

  WAIT_POS_X_RATIO: 0.50,
  WAIT_POS_Y_RATIO: 0.92,
  MARKERS_OFFSET_RATIO: 0.09,

  // ----------------------------------------------------------
  // Текстура лейнов.
  // Скорость СИНХРОНИЗИРОВАНА со скоростью ленты (BASE_FALL_SPEED,
  // SPEED_PER_PIZZA): textureFracPerSec = speedFracPerSec * SYNC_FACTOR.
  // SYNC_FACTOR < 1 — текстура "ползёт" медленнее груза (нет ряби),
  // но темп совпадает, включая ускорение от pizzasMade.
  // ----------------------------------------------------------
  TEXTURE_ENABLED: true,
  TEXTURE_PERIOD_RATIO: 0.04,
  TEXTURE_DOT_RATIO: 0.08,
  TEXTURE_ALPHA: 0.18,
  TEXTURE_SYNC_FACTOR: 0.5,

  LANE_COUNT: 3,
  MAX_MISSES: 3,

  MIN_RECIPE_LEN: 3,
  MAX_RECIPE_LEN: 6,

  SCORE_PER_INGREDIENT: 5,
  SCORE_PER_PIZZA:      50,

  BAD_INGREDIENT_CHANCE: 0.20,

  PIZZA_ANIM_MS: 1500,

  BOWL_FLASH_MS: 260,

  RESET_POSITION_AFTER_PIZZA: true,

  TIMER_WARN_RATIO:     0.50,
  TIMER_DANGER_RATIO:   0.20,
  TIMER_CRITICAL_RATIO: 0.10,

  BASE_FALL_SPEED: 2 * 60,
  SPEED_PER_PIZZA: 0.20,

  BASE_SPAWN_MIN_MS: 80 * (1000 / 60),
  BASE_SPAWN_MAX_MS: 150 * (1000 / 60),
  SPAWN_RATE_PER_PIZZA: 0.10,
  MIN_SPAWN_INTERVAL_MS: 65 * (1000 / 60),

  COLORS: {
    bg:              { var: '--color-field-bg',        fallback: '#fafafa' },
    recipeBg:        { var: '--color-recipe-bg',       fallback: '#f0f0f0' },
    recipeBorder:    { var: '--color-recipe-border',   fallback: '#000000' },
    recipeText:      { var: '--color-recipe-text',     fallback: '#000000' },
    recipeIconBg:    { var: '--color-recipe-icon-bg',  fallback: '#ffffff' },
    recipeIconBorder:{ var: '--color-recipe-icon-br',  fallback: '#888888' },
    recipeCheck:     { var: '--color-recipe-check',    fallback: '#00aa00' },
    recipeCheckBg:   { var: '--color-recipe-check-bg', fallback: 'rgba(0,180,0,0.3)' },
    recipeArrow:     { var: '--color-recipe-arrow',    fallback: '#888888' },

    hudLabel:        { var: '--color-text-dim',        fallback: '#555555' },
    hudValue:        { var: '--color-text-accent',     fallback: '#000000' },

    timerNormal:     { var: '--color-timer-normal',    fallback: '#38b24a' },
    timerWarning:    { var: '--color-timer-warning',   fallback: '#d87a0f' },
    timerDanger:     { var: '--color-timer-danger',    fallback: '#cc0000' },

    conveyorBg:       { var: '--color-conveyor-bg',        fallback: '#d8d8d8' },
    conveyorBgBottom: { var: '--color-conveyor-bg-bottom', fallback: '#c4c4c4' },
    conveyorBorder:   { var: '--color-conveyor-border',    fallback: '#a0a0a0' },
    conveyorActive:   { var: '--color-conveyor-active',    fallback: 'rgba(255,200,0,0.8)' },
    conveyorActiveBg: { var: '--color-conveyor-active-bg', fallback: 'rgba(255,220,100,0.35)' },
    conveyorTexture:  { var: '--color-conveyor-texture',   fallback: '#000000' },

    bowlBody:        { var: '--color-bowl-body',       fallback: '#d8d8d8' },
    bowlRim:         { var: '--color-bowl-rim',        fallback: '#e8e8e8' },
    bowlInner:       { var: '--color-bowl-inner',      fallback: '#b0b0b0' },
    bowlInnerBorder: { var: '--color-bowl-inner-br',   fallback: '#888888' },
    bowlBorder:      { var: '--color-bowl-border',     fallback: '#555555' },
    bowlShadow:      { var: '--color-bowl-shadow',     fallback: 'rgba(0,0,0,0.15)' },
    bowlHighlight:   { var: '--color-bowl-highlight',  fallback: 'rgba(255,255,255,0.7)' },
    bowlFlashGood:   { var: '--color-bowl-flash-good', fallback: '#38b24a' },
    bowlFlashBad:    { var: '--color-bowl-flash-bad',  fallback: '#d22b2b' },

    zoneFill:        { var: '--color-zone-fill',       fallback: 'rgba(0,120,255,1)' },
    zoneBorder:      { var: '--color-zone-border',     fallback: 'rgba(0,100,200,1)' },
    zoneText:        { var: '--color-zone-text',       fallback: 'rgba(0,100,200,1)' },

    tapMarker:       { var: '--color-tap-marker',      fallback: 'rgba(255,100,100,1)' },

    scoreText:       { var: '--color-score-text',      fallback: '#000000' },
    missesText:      { var: '--color-misses-text',     fallback: '#000000' },
    missesDanger:    { var: '--color-misses-danger',   fallback: '#cc0000' },
    pizzasText:      { var: '--color-pizzas-text',     fallback: '#888888' },

    pizzaGlow:       { var: '--color-pizza-glow',      fallback: 'rgba(255,240,200,0.7)' },
    pizzaBase:       { var: '--color-pizza-base',      fallback: '#e0b070' },
    pizzaBaseBorder: { var: '--color-pizza-base-br',   fallback: '#a07040' },
    pizzaSauce:      { var: '--color-pizza-sauce',     fallback: '#e03030' },
    pizzaCheese:     { var: '--color-pizza-cheese',    fallback: '#f7d040' },
    pizzaPep:        { var: '--color-pizza-pep',       fallback: '#c04020' },
    pizzaPepBorder:  { var: '--color-pizza-pep-br',    fallback: '#802010' },

    gameOverOverlay: { var: '--color-gameover-bg',     fallback: 'rgba(255,255,255,0.9)' },
    gameOverTitle:   { var: '--color-gameover-title',  fallback: '#000000' },
    gameOverText:    { var: '--color-gameover-text',   fallback: '#000000' },

    ingredients: [
      { id: 'dough',  colorVar: '--color-ing-dough',  borderVar: '--color-ing-dough-br',  fallback: { color: '#e0b070', border: '#a07040' } },
      { id: 'tomato', colorVar: '--color-ing-tomato', borderVar: '--color-ing-tomato-br', fallback: { color: '#e03030', border: '#801818' } },
      { id: 'cheese', colorVar: '--color-ing-cheese', borderVar: '--color-ing-cheese-br', fallback: { color: '#f7d040', border: '#b09020' } },
      { id: 'pep',    colorVar: '--color-ing-pep',    borderVar: '--color-ing-pep-br',    fallback: { color: '#c04020', border: '#802010' } },
      { id: 'herb',   colorVar: '--color-ing-herb',   borderVar: '--color-ing-herb-br',   fallback: { color: '#50a050', border: '#206020' } },
      { id: 'mush',   colorVar: '--color-ing-mush',   borderVar: '--color-ing-mush-br',   fallback: { color: '#c8b090', border: '#806040' } },
      { id: 'olive',  colorVar: '--color-ing-olive',  borderVar: '--color-ing-olive-br',  fallback: { color: '#202020', border: '#000000' } },
      { id: 'bacon',  colorVar: '--color-ing-bacon',  borderVar: '--color-ing-bacon-br',  fallback: { color: '#d08060', border: '#804030' } },
      { id: 'pepper', colorVar: '--color-ing-pepper', borderVar: '--color-ing-pepper-br', fallback: { color: '#f08030', border: '#a05010' } },
      { id: 'onion',  colorVar: '--color-ing-onion',  borderVar: '--color-ing-onion-br',  fallback: { color: '#e0d0e0', border: '#a080b0' } },
      { id: 'pine',   colorVar: '--color-ing-pine',   borderVar: '--color-ing-pine-br',   fallback: { color: '#f0e020', border: '#a0a010' } },
      { id: 'chick',  colorVar: '--color-ing-chick',  borderVar: '--color-ing-chick-br',  fallback: { color: '#f0d0b0', border: '#a09070' } },
      { id: 'ham',    colorVar: '--color-ing-ham',    borderVar: '--color-ing-ham-br',    fallback: { color: '#f0a0a0', border: '#a06060' } },
      { id: 'spin',   colorVar: '--color-ing-spin',   borderVar: '--color-ing-spin-br',   fallback: { color: '#30a030', border: '#106010' } },

      { id: 'egg',    colorVar: '--color-ing-egg',    borderVar: '--color-ing-egg-br',    fallback: { color: '#fff6d6', border: '#e0c060' } },
      { id: 'pork',   colorVar: '--color-ing-pork',   borderVar: '--color-ing-pork-br',   fallback: { color: '#f0a0a0', border: '#c06060' } },
      { id: 'cabbage', colorVar: '--color-ing-cabbage', borderVar: '--color-ing-cabbage-br', fallback: { color: '#8fd07a', border: '#4a8a3a' } },
      { id: 'chilli',  colorVar: '--color-ing-chilli',  borderVar: '--color-ing-chilli-br',  fallback: { color: '#e03030', border: '#801818' } },
    ],
    badIngredient: {
      id: 'bad',
      colorVar: '--color-ing-bad', borderVar: '--color-ing-bad-br',
      fallback: { color: '#806050', border: '#402818' },
    },
  },
};