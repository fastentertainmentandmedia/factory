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

  ITEM_SIZE_RATIO:        0.14,
  RECIPE_ITEM_SIZE_RATIO: 0.11,
  LANE_WIDTH_RATIO:       0.20,
  TAP_RADIUS_RATIO:       0.12,

  WAIT_POS_X_RATIO: 0.50,
  WAIT_POS_Y_RATIO: 0.92,
  MARKERS_OFFSET_RATIO: 0.09,

  TEXTURE_ENABLED: true,
  TEXTURE_PERIOD_RATIO: 0.06,
  TEXTURE_DOT_RATIO: 0.08,
  TEXTURE_ALPHA: 0.18,
  TEXTURE_SYNC_FACTOR: 0.30,

  LANE_COUNT: 3,
  MAX_MISSES: 3,

  MIN_RECIPE_LEN: 4,
  MAX_RECIPE_LEN: 6,

  SCORE_PER_INGREDIENT: 5,
  SCORE_PER_PIZZA:      50,

  // Вероятность «плохого» ингредиента (danger) в спавне.
  BAD_INGREDIENT_CHANCE: 0.05,

  // Вероятность спавна «лишнего» ингредиента (не из текущего
  // рецепта) — для разнообразия на ленте.
  //   0   — только рецептные (+ danger)
  //   0.3 — ~30% спавнов «лишние», 70% рецептные
  //   1   — только «лишние» (+ danger)
  EXTRA_SPAWN_CHANCE: 0.40,

  BAD_INSTANT_GAME_OVER: true,

  SPAWN_ANTI_REPEAT: 3,
  SPAWN_ANTI_REPEAT_PER_LANE: 1,

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

    scoreText:       { var: '--color-score-text',      fallback: '#000000' },
    missesText:      { var: '--color-misses-text',     fallback: '#000000' },
    missesDanger:    { var: '--color-misses-danger',   fallback: '#cc0000' },

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
  },
};