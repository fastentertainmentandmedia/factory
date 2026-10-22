// ============================================================
// [FILE: core/js/render.js]
// Ингредиенты — из gameConfig.INGREDIENTS (id/src/fallback).
// Вписывание в слот — через INGREDIENT_FIT / FIT_SCALE /
// FIT_PADDING / FIT_OVERRIDES (всё в game/js/config.js).
// ============================================================

import { config } from './config.js';
import { gameConfig } from '../../game/js/config.js';
import { drawProceduralIngredient } from './ingredient-drawers.js';


function readColor(el, spec) {
  const v = el.getPropertyValue(spec.var).trim();
  return v || spec.fallback;
}


export function createRenderer(canvas, callbacks = {}) {

  const ctx = canvas.getContext('2d', { alpha: false });
  const onImageReady = callbacks.onImageReady ?? (() => {});

  let W = canvas.clientWidth  || 520;
  let H = canvas.clientHeight || 720;

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

  let texturePeriodPx = 0;
  let texturePatternCanvas = null;
  let texturePattern = null;
  let textureOffset = 0;
  let lastTextureTs = 0;

  let COLORS = {};
  let HUD_FONT = 'monospace';

  // ----------------------------------------------------------
  // Ингредиенты: карта id → { ingr, img, ready }
  // ----------------------------------------------------------
  const ING = {};       // id → { ingr, img, ready }
  let BAD_INGR = null;  // { id, src, fallback, img, ready }

  (function loadIngredientImages() {
    const list = [
      ...(gameConfig.INGREDIENTS || []),
      ...(gameConfig.BAD_INGREDIENT ? [gameConfig.BAD_INGREDIENT] : []),
    ];

    for (const ingr of list) {
      const entry = { ingr, img: null, ready: false };
      if (ingr.src) {
        const img = new Image();
        img.onload = () => { entry.ready = true; onImageReady(); };
        img.onerror = () => {};
        img.src = ingr.src;
        entry.img = img;
      }
      ING[ingr.id] = entry;
    }

    if (gameConfig.BAD_INGREDIENT) {
      BAD_INGR = ING[gameConfig.BAD_INGREDIENT.id];
    }
  })();

  function hasImgFor(id) {
    const e = ING[id];
    return !!(e && e.img && e.ready);
  }

  // ----------------------------------------------------------
  // Цвета + шрифт
  // ----------------------------------------------------------
  function refreshColors() {
    const style = getComputedStyle(document.documentElement);

    const C = {};
    for (const [key, spec] of Object.entries(config.COLORS)) {
      C[key] = readColor(style, spec);
    }
    COLORS = C;

    const fontRaw = style.getPropertyValue('--font-mono').trim();
    HUD_FONT = fontRaw || "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    buildTexturePattern();
  }

  // ----------------------------------------------------------
  // Текстура
  // ----------------------------------------------------------
  function buildTexturePattern() {
    if (!config.TEXTURE_ENABLED || texturePeriodPx <= 0) {
      texturePattern = null;
      texturePatternCanvas = null;
      return;
    }

    const period = Math.max(6, Math.round(texturePeriodPx));
    const dot = Math.max(1, Math.round(period * config.TEXTURE_DOT_RATIO));

    texturePatternCanvas = document.createElement('canvas');
    texturePatternCanvas.width = period;
    texturePatternCanvas.height = period;

    const pctx = texturePatternCanvas.getContext('2d');
    pctx.clearRect(0, 0, period, period);

    const base = COLORS.conveyorTexture || '#000000';
    const parsed = parseColor(base);
    const alpha = config.TEXTURE_ALPHA;

    pctx.fillStyle = parsed
      ? `rgba(${parsed.r},${parsed.g},${parsed.b},${alpha})`
      : base;

    pctx.beginPath();
    pctx.arc(period / 2, period / 2, dot / 2, 0, Math.PI * 2);
    pctx.fill();

    texturePattern = ctx.createPattern(texturePatternCanvas, 'repeat');
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
    recipeItemSize = config.RECIPE_ITEM_SIZE_RATIO * W;

    laneWidth = config.LANE_WIDTH_RATIO * W;
    tapRadius = config.TAP_RADIUS_RATIO * minWH;
    waitX = config.WAIT_POS_X_RATIO * W;
    waitY = config.WAIT_POS_Y_RATIO * H;
    markersY = conveyorBottom + config.MARKERS_OFFSET_RATIO * H;

    texturePeriodPx = config.TEXTURE_PERIOD_RATIO * H;
  }

  function resize(cssW, cssH, dpr = 1) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = cssW;
    H = cssH;
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
    const fitSpec = getFitSpec(ingr.id);

    // 1) картинка
    const entry = ING[ingr.id];
    if (entry && entry.img && entry.ready) {
      drawImageFitted(ctx, entry.img, cx, cy, size, fitSpec);
      return;
    }

    // 2) процедурный fallback
    const c = ingr.fallback || { color: '#ccc', border: '#666' };
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

    drawProceduralIngredient(ctx, r, ingr, c);

    ctx.restore();
  }

  function getFitSpec(id) {
    const ov = (gameConfig.INGREDIENT_FIT_OVERRIDES || {})[id] || {};
    return {
      fit:   ov.fit   || gameConfig.INGREDIENT_FIT   || 'contain',
      scale: ov.scale || gameConfig.INGREDIENT_FIT_SCALE || 1,
      padding: (ov.padding !== undefined)
        ? ov.padding
        : (gameConfig.INGREDIENT_FIT_PADDING || 0),
    };
  }

  function drawImageFitted(ctx, img, cx, cy, size, spec) {
    const iw = img.naturalWidth  || size;
    const ih = img.naturalHeight || size;

    const inner = size * (1 - spec.padding * 2);
    const box = inner * spec.scale;

    let dw, dh;

    if (spec.fit === 'cover') {
      const s = Math.max(box / iw, box / ih);
      dw = iw * s;
      dh = ih * s;
    } else if (spec.fit === 'fill') {
      dw = box;
      dh = box;
    } else {
      // 'contain'
      const s = Math.min(box / iw, box / ih);
      dw = iw * s;
      dh = ih * s;
    }

    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  }

  // ----------------------------------------------------------
  // Конвейер: градиент + текстура (синхронизирована со лентой)
  // ----------------------------------------------------------
  function drawConveyor(lx, isActive, offsetPx) {
    const halfW = laneWidth / 2;
    const left = lx - halfW;
    const width = laneWidth;
    const height = conveyorBottom - conveyorTop;

    const grad = ctx.createLinearGradient(left, conveyorTop, left, conveyorBottom);
    grad.addColorStop(0, COLORS.conveyorBg);
    grad.addColorStop(1, COLORS.conveyorBgBottom);

    ctx.fillStyle = grad;
    ctx.fillRect(left, conveyorTop, width, height);

    if (config.TEXTURE_ENABLED && texturePattern && texturePeriodPx > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(left, conveyorTop, width, height);
      ctx.clip();

      ctx.translate(0, offsetPx);
      ctx.fillStyle = texturePattern;
      ctx.fillRect(left, conveyorTop - texturePeriodPx, width, height + texturePeriodPx * 2);

      ctx.restore();
    }

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

  // ----------------------------------------------------------
  // Миска
  // ----------------------------------------------------------
  function drawBowl(cx, cy, bowlFlash) {
    let scale = 1;
    let dx = 0;
    let flashColor = null;
    let flashPulse = 0;

    if (bowlFlash) {
      flashPulse = Math.sin(Math.PI * bowlFlash.progress);
      if (bowlFlash.kind === 'good') {
        flashColor = COLORS.bowlFlashGood;
        scale = 1 + 0.10 * flashPulse;
      } else {
        flashColor = COLORS.bowlFlashBad;
        scale = 1 - 0.05 * flashPulse;
        dx = Math.sin(bowlFlash.progress * 40) * 2 * flashPulse;
      }
    }

    const bx = cx + dx;
    const rx = 45 * scale;

    const bodyColor  = flashColor ? mixColor(COLORS.bowlBody,  flashColor, 0.35 * flashPulse) : COLORS.bowlBody;
    const rimColor   = flashColor ? mixColor(COLORS.bowlRim,   flashColor, 0.35 * flashPulse) : COLORS.bowlRim;
    const innerColor = flashColor ? mixColor(COLORS.bowlInner, flashColor, 0.35 * flashPulse) : COLORS.bowlInner;
    const borderColor = flashColor || COLORS.bowlBorder;

    ctx.beginPath();
    ctx.ellipse(bx, cy + 12, rx, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.bowlShadow;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bx - rx, cy - 15);
    ctx.lineTo(bx + rx, cy - 15);
    ctx.quadraticCurveTo(bx + rx, cy + 35, bx, cy + 35);
    ctx.quadraticCurveTo(bx - rx, cy + 35, bx - rx, cy - 15);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(bx, cy - 15, rx, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = rimColor;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(bx, cy - 15, rx * 0.85, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = innerColor;
    ctx.fill();
    ctx.strokeStyle = COLORS.bowlInnerBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(bx - 20, cy - 16, 12, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.bowlHighlight;
    ctx.fill();
  }

  // ----------------------------------------------------------
  // Зоны тапа
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
  // Верхняя панель
  // ----------------------------------------------------------
  function drawRecipe(state) {
    const { recipe, collected } = state;

    const panelH = hudTopH + hudRecipeH + 8;

    ctx.fillStyle = COLORS.recipeBg;
    ctx.fillRect(0, 0, W, panelH);

    ctx.strokeStyle = COLORS.recipeBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, panelH);
    ctx.lineTo(W, panelH);
    ctx.stroke();

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
      const ingr = INGR_BY_ID(id);
      const ix = startX + i * gap;

      const hasImg = hasImgFor(ingr.id);

      if (!hasImg) {
        ctx.beginPath();
        ctx.arc(ix, iconY, iconSize/2 + 2, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.recipeIconBg;
        ctx.fill();
        ctx.strokeStyle = COLORS.recipeIconBorder;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

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
        ctx.font = `${Math.min(14, gap*0.4)}px ${HUD_FONT}`;
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
    ctx.font = `bold 28px ${HUD_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('+50', px, py + pr + 50);
    ctx.font = `bold 20px ${HUD_FONT}`;
    ctx.fillText('ПИЦЦА ГОТОВА!', px, py + pr + 80);
  }

  function drawGameOver(state) {
    ctx.fillStyle = COLORS.gameOverOverlay;
    ctx.fillRect(0, H/2 - 60, W, 120);

    ctx.fillStyle = COLORS.gameOverTitle;
    ctx.textAlign = 'center';
    ctx.font = `bold 36px ${HUD_FONT}`;
    ctx.fillText('GAME OVER', W/2, H/2 - 10);

    ctx.fillStyle = COLORS.gameOverText;
    ctx.font = `bold 20px ${HUD_FONT}`;
    ctx.fillText(`СЧЁТ: ${state.score}`, W/2, H/2 + 20);

    ctx.font = `16px ${HUD_FONT}`;
    ctx.fillText('тап по экрану — рестарт', W/2, H/2 + 50);
  }

  function render(state) {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    drawRecipe(state);

    let textureOffsetPx = 0;
    if (config.TEXTURE_ENABLED && texturePattern && texturePeriodPx > 0) {
      const ts = performance.now();
      const dtSec = lastTextureTs ? (ts - lastTextureTs) / 1000 : 0;
      lastTextureTs = ts;

      const speedFracPerSec =
        (config.BASE_FALL_SPEED / 720) *
        (1 + (state.pizzasMade || 0) * config.SPEED_PER_PIZZA);

      const textureFracPerSec = speedFracPerSec * config.TEXTURE_SYNC_FACTOR;
      const periodsPerSec = textureFracPerSec / config.TEXTURE_PERIOD_RATIO;

      textureOffset = (textureOffset + dtSec * periodsPerSec) % 1;
      textureOffsetPx = textureOffset * texturePeriodPx;
    }

    for (let l = 0; l < config.LANE_COUNT; l++) {
      drawConveyor(
        laneX[l],
        l === state.currentPos && !state.over && !state.pizzaAnim,
        textureOffsetPx
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
    drawBowl(dishX, dishY, state.bowlFlash);

    if (state.currentPos === 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = `bold 12px ${HUD_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('ОЖИДАНИЕ', dishX, dishY + 55);
    }

    if (state.pizzaAnim) drawPizzaAnim(state.pizzaAnim);
    if (state.over) drawGameOver(state);
  }

  // ----------------------------------------------------------
  // Утилиты
  // ----------------------------------------------------------
  function withAlpha(color, a) {
    const c = parseColor(color);
    if (!c) return color;
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }

  function mixColor(c1, c2, t) {
    const a = parseColor(c1);
    const b = parseColor(c2);
    if (!a || !b) return c1;
    t = Math.max(0, Math.min(1, t));
    const r = Math.round(a.r + (b.r - a.r) * t);
    const g = Math.round(a.g + (b.g - a.g) * t);
    const bl = Math.round(a.b + (b.b - a.b) * t);
    const al = a.a + (b.a - a.a) * t;
    return `rgba(${r},${g},${bl},${al})`;
  }

  function parseColor(color) {
    if (!color) return null;
    color = color.trim();

    if (color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split('').map(ch => ch + ch).join('');
      if (hex.length === 6) {
        return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16), a: 1 };
      }
      if (hex.length === 8) {
        return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16), a: parseInt(hex.slice(6, 8), 16) / 255 };
      }
      return null;
    }

    const m = color.match(/^rgba?\(([^)]+)\)$/);
    if (!m) return null;
    const parts = m[1].split(',').map(s => parseFloat(s.trim()));
    if (parts.length < 3) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length >= 4 ? parts[3] : 1 };
  }

  function INGR_BY_ID(id) {
    const e = ING[id];
    return e ? e.ingr : { id, fallback: { color: '#ccc', border: '#666' } };
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