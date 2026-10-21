// ============================================================
// [FILE: core/js/render.js]
// Canvas 2D отрисовка Pizza Catch.
// Верхняя панель (две строки):
//   верхняя — таймер/промахи (слева), рекорд/счёт (справа)
//   нижняя  — ингредиенты рецепта (на всю ширину)
// Лейны: вертикальный градиент. Зоны тапа: только круги.
// ============================================================

import { config } from './config.js';
import { gameConfig } from '../../game/js/config.js';
import { getBestScore, getRemainingMs } from './player-limits.js';


function readColor(el, spec) {
  const v = el.getPropertyValue(spec.var).trim();
  return v || spec.fallback;
}

function readIngredientColors(style, spec) {
  const color  = style.getPropertyValue(spec.colorVar).trim()  || spec.fallback.color;
  const border = style.getPropertyValue(spec.borderVar).trim() || spec.fallback.border;
  return { id: spec.id, color, border, bad: spec.id === 'bad' };
}


export function createRenderer(canvas, callbacks = {}) {

  const ctx = canvas.getContext('2d');
  const onImageReady = callbacks.onImageReady ?? (() => {});

  let W = canvas.width  || 520;
  let H = canvas.height || 720;

  let laneX = [];
  let hudTopH = 0;
  let hudRecipeH = 0;
  let recipeY = 0;
  let hudPadding = 0;
  let conveyorTop = 0;
  let conveyorBottom = 0;
  let itemSize = 0;
  let recipeItemSize = 0;
  let laneWidth = 0;
  let tapRadius = 0;
  let waitX = 0;
  let waitY = 0;
  let markersY = 0;

  let COLORS = {};
  let ING_COLORS = {};
  let BAD_COLOR = null;

  // ----------------------------------------------------------
  // SVG/PNG ингредиентов (опционально)
  // ----------------------------------------------------------
  const ING_IMAGES = {};
  const ING_IMAGES_READY = {};

  (function loadIngredientImages() {
    const paths = gameConfig?.ASSETS?.ingredients || {};
    for (const [id, src] of Object.entries(paths)) {
      if (!src) continue;
      const img = new Image();
      img.onload = () => {
        ING_IMAGES_READY[id] = true;
        onImageReady();
      };
      img.onerror = () => {};
      img.src = src;
      ING_IMAGES[id] = img;
    }
  })();

  // ----------------------------------------------------------
  // Цвета
  // ----------------------------------------------------------
  function refreshColors() {
    const style = getComputedStyle(document.documentElement);

    const C = {};
    for (const [key, spec] of Object.entries(config.COLORS)) {
      if (key === 'ingredients' || key === 'badIngredient') continue;
      C[key] = readColor(style, spec);
    }
    COLORS = C;

    ING_COLORS = {};
    for (const spec of config.COLORS.ingredients) {
      const c = readIngredientColors(style, spec);
      ING_COLORS[c.id] = c;
    }
    BAD_COLOR = readIngredientColors(style, config.COLORS.badIngredient);
  }

  function ingrColors(ingr) {
    if (ingr && ingr.id === 'bad') return BAD_COLOR;
    return ING_COLORS[ingr?.id] || { id: ingr?.id, color: '#ccc', border: '#666' };
  }

  // ----------------------------------------------------------
  // Геометрия
  // ----------------------------------------------------------
  function recomputeGeometry() {
    const minWH = Math.min(W, H);
    laneX = config.LANE_X_RATIOS.map(r => r * W);

    hudTopH     = config.HUD_TOP_H_RATIO * H;
    hudRecipeH  = config.HUD_RECIPE_H_RATIO * H;
    recipeY     = hudTopH;
    hudPadding  = config.HUD_PADDING_RATIO * W;

    conveyorTop = config.CONVEYOR_TOP_RATIO * H;
    conveyorBottom = config.CONVEYOR_BOTTOM_RATIO * H;

    itemSize = config.ITEM_SIZE_RATIO * minWH;

    // Размер иконки рецепта — от ширины, т.к. нижняя строка теперь
    // на всю ширину W.
    recipeItemSize = config.RECIPE_ITEM_SIZE_RATIO * W;

    laneWidth = config.LANE_WIDTH_RATIO * W;
    tapRadius = config.TAP_RADIUS_RATIO * minWH;
    waitX = config.WAIT_POS_X_RATIO * W;
    waitY = config.WAIT_POS_Y_RATIO * H;
    markersY = conveyorBottom + config.MARKERS_OFFSET_RATIO * H;
  }

  function resize(w, h) {
    canvas.width = w;
    canvas.height = h;
    W = w;
    H = h;
    recomputeGeometry();
    refreshColors();
    onImageReady();
  }

  function getTapZones() {
    return [
      { pos: 0, x: laneX[0], y: markersY, radius: tapRadius },
      { pos: 1, x: laneX[1], y: markersY, radius: tapRadius },
      { pos: 2, x: laneX[2], y: markersY, radius: tapRadius },
      { pos: 3, x: waitX,    y: waitY,    radius: tapRadius },
    ];
  }

  // ----------------------------------------------------------
  // Ингредиент
  // ----------------------------------------------------------
  function drawIngredient(cx, cy, ingr, size) {
    if (ingr && ING_IMAGES[ingr.id] && ING_IMAGES_READY[ingr.id]) {
      const img = ING_IMAGES[ingr.id];
      ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
      return;
    }

    const c = ingrColors(ingr);
    const r = size / 2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.arc(2, 2, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = c.color;
    ctx.fill();
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 3;
    ctx.stroke();

    if (ingr.id === 'dough') {
      ctx.fillStyle = 'rgba(160,112,64,0.5)';
      ctx.beginPath(); ctx.arc(-r*0.3, -r*0.2, r*0.15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.2, r*0.3, r*0.12, 0, Math.PI*2); ctx.fill();
    } else if (ingr.id === 'tomato') {
      ctx.fillStyle = '#50a050';
      ctx.beginPath();
      ctx.ellipse(0, -r*0.7, r*0.3, r*0.15, 0, 0, Math.PI*2);
      ctx.fill();
    } else if (ingr.id === 'cheese') {
      ctx.fillStyle = 'rgba(180,144,32,0.7)';
      ctx.beginPath(); ctx.arc(-r*0.25, -r*0.1, r*0.12, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.3, r*0.15, r*0.1, 0, Math.PI*2); ctx.fill();
    } else if (ingr.id === 'pep') {
      ctx.fillStyle = 'rgba(80,20,10,0.5)';
      ctx.beginPath(); ctx.arc(-r*0.2, -r*0.2, r*0.15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.2, r*0.2, r*0.13, 0, Math.PI*2); ctx.fill();
    } else if (ingr.id === 'herb') {
      ctx.strokeStyle = '#206020';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-r*0.4, 0); ctx.lineTo(r*0.4, 0); ctx.stroke();
    } else if (ingr.id === 'mush') {
      ctx.fillStyle = '#806040';
      ctx.beginPath();
      ctx.ellipse(0, -r*0.3, r*0.6, r*0.3, 0, Math.PI, 0);
      ctx.fill();
    } else if (ingr.id === 'olive') {
      ctx.fillStyle = '#a0a0a0';
      ctx.beginPath(); ctx.arc(0, 0, r*0.25, 0, Math.PI*2); ctx.fill();
    } else if (ingr.id === 'bacon') {
      ctx.strokeStyle = '#f0a080';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-r*0.5, -r*0.3); ctx.lineTo(r*0.3, -r*0.1);
      ctx.moveTo(-r*0.3, r*0.1);  ctx.lineTo(r*0.5, r*0.3);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-r*0.1, -r*0.2, r*0.1, 0, Math.PI*2); ctx.fill();
    } else if (ingr.id === 'pepper') {
      ctx.strokeStyle = '#c05010';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, r*0.5, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = '#f0c040';
      ctx.beginPath(); ctx.arc(0, 0, r*0.2, 0, Math.PI*2); ctx.fill();
    } else if (ingr.id === 'onion') {
      ctx.strokeStyle = '#c0a0d0';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, r*0.6, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r*0.4, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r*0.2, 0, Math.PI*2); ctx.stroke();
    } else if (ingr.id === 'pine') {
      ctx.strokeStyle = '#c0b020';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r*0.4, -r*0.4); ctx.lineTo(r*0.4, r*0.4);
      ctx.moveTo(r*0.4, -r*0.4);  ctx.lineTo(-r*0.4, r*0.4);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(0, 0, r*0.12, 0, Math.PI*2); ctx.fill();
    } else if (ingr.id === 'chick') {
      ctx.strokeStyle = '#d0a080';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r*0.5, -r*0.2); ctx.lineTo(r*0.5, -r*0.3);
      ctx.moveTo(-r*0.5, 0);      ctx.lineTo(r*0.5, -r*0.1);
      ctx.moveTo(-r*0.5, r*0.2);  ctx.lineTo(r*0.5, r*0.1);
      ctx.stroke();
    } else if (ingr.id === 'ham') {
      ctx.fillStyle = 'rgba(255,200,200,0.7)';
      ctx.beginPath(); ctx.arc(-r*0.2, -r*0.2, r*0.15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.3, r*0.2, r*0.12, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.1, -r*0.4, r*0.1, 0, Math.PI*2); ctx.fill();
    } else if (ingr.id === 'spin') {
      ctx.fillStyle = '#208020';
      ctx.beginPath();
      ctx.ellipse(0, 0, r*0.5, r*0.25, 0.5, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#105010';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r*0.4, -r*0.15); ctx.lineTo(r*0.4, r*0.15); ctx.stroke();
    } else if (ingr.id === 'bad') {
      ctx.strokeStyle = '#400';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-r*0.5, -r*0.5); ctx.lineTo(r*0.5, r*0.5);
      ctx.moveTo(r*0.5, -r*0.5);  ctx.lineTo(-r*0.5, r*0.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ----------------------------------------------------------
  // Конвейер: вертикальный градиент.
  // ----------------------------------------------------------
  function drawConveyor(lx, isActive) {
    const halfW = laneWidth / 2;
    const left = lx - halfW;
    const width = laneWidth;
    const height = conveyorBottom - conveyorTop;

    const grad = ctx.createLinearGradient(left, conveyorTop, left, conveyorBottom);
    grad.addColorStop(0, COLORS.conveyorBg);
    grad.addColorStop(1, COLORS.conveyorBgBottom);

    ctx.fillStyle = grad;
    ctx.fillRect(left, conveyorTop, width, height);

    ctx.strokeStyle = COLORS.conveyorBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, conveyorTop);  ctx.lineTo(left, conveyorBottom);
    ctx.moveTo(left + width, conveyorTop); ctx.lineTo(left + width, conveyorBottom);
    ctx.stroke();

    if (isActive) {
      ctx.strokeStyle = COLORS.conveyorActive;
      ctx.lineWidth = 3;
      ctx.strokeRect(left - 1, conveyorTop - 1, width + 2, height + 2);

      ctx.fillStyle = COLORS.conveyorActiveBg;
      ctx.fillRect(left, conveyorBottom - 30, width, 30);
    }
  }

  function drawBowl(cx, cy, grabFlash) {
    const flashScale = grabFlash > 0 ? 1.05 : 1;
    const rx = 45 * flashScale;

    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, rx, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.bowlShadow;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - rx, cy - 15);
    ctx.lineTo(cx + rx, cy - 15);
    ctx.quadraticCurveTo(cx + rx, cy + 35, cx, cy + 35);
    ctx.quadraticCurveTo(cx - rx, cy + 35, cx - rx, cy - 15);
    ctx.closePath();
    ctx.fillStyle = COLORS.bowlBody;
    ctx.fill();
    ctx.strokeStyle = COLORS.bowlBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy - 15, rx, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.bowlRim;
    ctx.fill();
    ctx.strokeStyle = COLORS.bowlBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy - 15, rx * 0.85, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.bowlInner;
    ctx.fill();
    ctx.strokeStyle = COLORS.bowlInnerBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx - 20, cy - 16, 12, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.bowlHighlight;
    ctx.fill();
  }

  // ----------------------------------------------------------
  // Зоны тапа: только круги.
  // ----------------------------------------------------------
  function drawPositionMarkers(currentPos) {
    const zones = getTapZones();

    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      if (z.pos === currentPos) continue;

      const pulse = 0.5 + Math.sin(performance.now() / 400 + i) * 0.3;

      ctx.beginPath();
      ctx.arc(z.x, z.y, tapRadius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = withAlpha(COLORS.zoneFill, 0.06 + pulse * 0.08);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(z.x, z.y, tapRadius * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = withAlpha(COLORS.zoneBorder, 0.4 + pulse * 0.3);
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // ----------------------------------------------------------
  // Верхняя панель: две строки.
  //   верхняя — таймер/промахи (слева), рекорд/счёт (справа)
  //   нижняя  — ингредиенты рецепта на всю ширину
  // ----------------------------------------------------------
  function drawRecipe(state) {
    const { recipe, collected, score, misses } = state;

    const panelH = hudTopH + hudRecipeH + 8;

    // фон панели
    ctx.fillStyle = COLORS.recipeBg;
    ctx.fillRect(0, 0, W, panelH);

    // разделительная линия между строками
    ctx.strokeStyle = COLORS.recipeBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hudPadding, recipeY);
    ctx.lineTo(W - hudPadding, recipeY);
    ctx.stroke();

    // нижняя граница панели
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, panelH);
    ctx.lineTo(W, panelH);
    ctx.stroke();

    // ==========================================================
    // ВЕРХНЯЯ СТРОКА: тексты
    // ==========================================================
    const topCenterY = recipeY / 2;

    // ---------- СЛЕВА: таймер + промахи ----------
    const timeLeftMs = getRemainingMs();
    const totalSec = Math.ceil(timeLeftMs / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // таймер — крупно, слева по центру верхней строки
    ctx.fillStyle = COLORS.recipeText;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`${mm}:${ss}`, hudPadding, topCenterY);

    // ширина таймера — чтобы отодвинуть промахи вправо
    const timerW = ctx.measureText(`${mm}:${ss}`).width;

    // промахи — справа от таймера, мельче
    ctx.fillStyle = misses >= config.MAX_MISSES - 1
      ? COLORS.missesDanger
      : COLORS.missesText;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(
      `ПРОМАХИ ${misses}/${config.MAX_MISSES}`,
      hudPadding + timerW + 16,
      topCenterY
    );

    // ---------- СПРАВА: рекорд + счёт ----------
    const best = getBestScore();

    ctx.textAlign = 'right';

    // счёт — крупно, справа
    ctx.fillStyle = COLORS.scoreText;
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`СЧЁТ ${score}`, W - hudPadding, topCenterY);

    const scoreW = ctx.measureText(`СЧЁТ ${score}`).width;

    // рекорд — левее счёта, помельче
    ctx.fillStyle = COLORS.recipeText;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(
      `РЕКОРД ${best}`,
      W - hudPadding - scoreW - 16,
      topCenterY
    );

    ctx.textBaseline = 'alphabetic';

    // ==========================================================
    // НИЖНЯЯ СТРОКА: ингредиенты рецепта (на всю ширину)
    // ==========================================================
    const len = recipe.length;

    const leftBound  = hudPadding;
    const rightBound = W - hudPadding;
    const availableWidth = Math.max(0, rightBound - leftBound);

    const gap = availableWidth / Math.max(1, len);
    const iconSize = Math.min(recipeItemSize, gap - 6);
    const startX = leftBound + gap / 2;
    const iconY = recipeY + hudRecipeH / 2;

    for (let i = 0; i < len; i++) {
      const id = recipe[i];
      const ingr = ALL_INGR_BY_ID(id);
      const ix = startX + i * gap;

      ctx.beginPath();
      ctx.arc(ix, iconY, iconSize/2 + 2, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.recipeIconBg;
      ctx.fill();
      ctx.strokeStyle = COLORS.recipeIconBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      drawIngredient(ix, iconY, ingr, iconSize);

      if (i < collected) {
        ctx.beginPath();
        ctx.arc(ix, iconY, iconSize/2 + 2, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.recipeCheckBg;
        ctx.fill();
        ctx.strokeStyle = COLORS.recipeCheck;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ix - iconSize*0.23, iconY);
        ctx.lineTo(ix - iconSize*0.05, iconY + iconSize*0.17);
        ctx.lineTo(ix + iconSize*0.3, iconY - iconSize*0.23);
        ctx.stroke();
      }

      if (i < len - 1) {
        ctx.fillStyle = COLORS.recipeArrow;
        ctx.font = `${Math.min(14, gap*0.4)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('→', ix + gap/2, iconY);
        ctx.textBaseline = 'alphabetic';
      }
    }
  }

  function drawPizzaAnim(pizzaAnim) {
    const t = pizzaAnim.elapsed / pizzaAnim.duration;
    const alpha = t < 0.5 ? t * 2 : (1 - t) * 2;
    const scale = 1 + Math.sin(t * Math.PI) * 0.5;

    ctx.fillStyle = withAlpha(COLORS.pizzaGlow, alpha);
    ctx.fillRect(0, 0, W, H);

    const px = W / 2;
    const py = H / 2 - 30;
    const pr = 70 * scale;

    ctx.beginPath();
    ctx.ellipse(px, py + 50, pr * 0.9, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.2})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.pizzaBase;
    ctx.fill();
    ctx.strokeStyle = COLORS.pizzaBaseBorder;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, pr * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.pizzaSauce;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, pr * 0.75, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.pizzaCheese;
    ctx.fill();

    const pepPositions = [
      [-pr*0.4, -pr*0.3], [pr*0.3, -pr*0.5], [pr*0.5, pr*0.2],
      [-pr*0.2, pr*0.4], [0, -pr*0.1], [-pr*0.5, pr*0.3],
    ];
    for (const [dx, dy] of pepPositions) {
      ctx.beginPath();
      ctx.arc(px + dx, py + dy, pr * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.pizzaPep;
      ctx.fill();
      ctx.strokeStyle = COLORS.pizzaPepBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('+50', px, py + pr + 50);
    ctx.font = 'bold 20px monospace';
    ctx.fillText('ПИЦЦА ГОТОВА!', px, py + pr + 80);
  }

  function drawGameOver(state) {
    ctx.fillStyle = COLORS.gameOverOverlay;
    ctx.fillRect(0, H/2 - 60, W, 120);

    ctx.fillStyle = COLORS.gameOverTitle;
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('GAME OVER', W/2, H/2 - 10);

    ctx.fillStyle = COLORS.gameOverText;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`СЧЁТ: ${state.score}`, W/2, H/2 + 20);

    ctx.font = '16px monospace';
    ctx.fillText('тап по экрану — рестарт', W/2, H/2 + 50);
  }

  function render(state) {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    drawRecipe(state);

    for (let l = 0; l < config.LANE_COUNT; l++) {
      drawConveyor(
        laneX[l],
        l === state.currentPos && !state.over && !state.pizzaAnim
      );
    }

    for (let l = 0; l < config.LANE_COUNT; l++) {
      const lx = laneX[l];
      const lane = state.lanes[l];
      const laneH = conveyorBottom - conveyorTop;
      for (const obj of lane) {
        const cy = conveyorTop + obj.y * laneH;
        drawIngredient(lx, cy, obj.ingr, itemSize);
      }
    }

    if (!state.over && !state.pizzaAnim) {
      drawPositionMarkers(state.currentPos);
    }

    let dishX, dishY;
    if (state.currentPos === 3) {
      dishX = waitX;
      dishY = waitY;
    } else {
      dishX = laneX[state.currentPos];
      dishY = conveyorBottom + 40;
    }
    drawBowl(dishX, dishY, state.grabFlash);

    if (state.currentPos === 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ОЖИДАНИЕ', dishX, dishY + 55);
    }

    if (state.pizzaAnim) drawPizzaAnim(state.pizzaAnim);
    if (state.over) drawGameOver(state);
  }

  function withAlpha(color, a) {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    }
    if (color.startsWith('rgba(')) {
      const parts = color.slice(5, -1).split(',').map(s => s.trim());
      return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`;
    }
    if (color.startsWith('rgb(')) {
      const parts = color.slice(4, -1).split(',').map(s => s.trim());
      return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`;
    }
    return color;
  }

  function ALL_INGR_BY_ID(id) {
    const found = config.COLORS.ingredients.find(x => x.id === id);
    if (found) return found;
    if (id === 'bad') return config.COLORS.badIngredient;
    return { id };
  }

  recomputeGeometry();
  refreshColors();

  return {
    render,
    resize,
    refreshColors,
    getTapZones,
    getTapRadius: () => tapRadius,
    getFieldSize: () => ({ w: W, h: H }),
  };
}