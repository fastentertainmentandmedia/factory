// ============================================================
// [FILE: core/js/rules.js]
// ============================================================

import { config } from './config.js';
import { gameConfig } from '../../game/js/config.js';

const ALL_GOOD = gameConfig.INGREDIENTS;
const BAD_INGREDIENT = gameConfig.BAD_INGREDIENT;
const STARTER_GROUP = gameConfig.STARTER_GROUP || [];
const STARTER_GROUP_SET = new Set(STARTER_GROUP);
const STARTER_COUNT = gameConfig.STARTER_COUNT || 0;


function randInt(n) { return Math.floor(Math.random() * n); }
function pick(arr) { return arr[randInt(arr.length)]; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function isBad(ingr) { return !!(ingr && (ingr.bad === true || ingr.id === 'danger')); }


export function createRules() {

  let lanes = [];
  let laneSpawnTimer = [];
  let currentPos = 3;
  let score = 0;
  let misses = 0;
  let pizzasMade = 0;
  let over = false;

  let recipe = [];
  let collected = [];

  let pizzaAnim = null;
  let bowlFlash = null;
  let conveyorOffset = 0;

  let fieldW = 520;
  let fieldH = 720;

  function setFieldSize(w, h) {
    fieldW = w;
    fieldH = h;
  }

  // ----------------------------------------------------------
  // Рецепт: длина случайная; ровно STARTER_COUNT из STARTER_GROUP;
  // остальные — случайные из НЕ-starter ингредиентов.
  // ----------------------------------------------------------
  function newRecipe() {
    const len = config.MIN_RECIPE_LEN +
                randInt(config.MAX_RECIPE_LEN - config.MIN_RECIPE_LEN + 1);

    const starterPool = STARTER_GROUP
      .map(id => ALL_GOOD.find(x => x.id === id))
      .filter(Boolean);

    const starterTake = Math.min(STARTER_COUNT, starterPool.length, len);
    const starters = shuffle(starterPool).slice(0, starterTake);

    // Из остальных исключаем ВСЮ группу starter, а не только выбранные.
    const restPool = ALL_GOOD.filter(x => !STARTER_GROUP_SET.has(x.id));
    const freeSlots = Math.max(0, len - starterTake);
    const restPicks = shuffle(restPool).slice(0, freeSlots);

    recipe = shuffle([...starters, ...restPicks]).map(x => x.id);
    collected = [];
  }

  // ----------------------------------------------------------
  // Вспышка миски
  // ----------------------------------------------------------
  function triggerBowlFlash(kind) {
    bowlFlash = {
      kind,
      startTime: performance.now(),
      duration: config.BOWL_FLASH_MS,
    };
  }

  function getBowlFlashState() {
    if (!bowlFlash) return null;
    const elapsed = performance.now() - bowlFlash.startTime;
    if (elapsed >= bowlFlash.duration) {
      bowlFlash = null;
      return null;
    }
    return { kind: bowlFlash.kind, progress: elapsed / bowlFlash.duration };
  }

  // ----------------------------------------------------------
  // Спавн
  // ----------------------------------------------------------
  function pickIngredientForSpawn() {
    if (Math.random() < config.BAD_INGREDIENT_CHANCE) return BAD_INGREDIENT;
    const remaining = recipe.slice(collected.length);
    if (remaining.length === 0) return pick(ALL_GOOD);
    const id = pick(remaining);
    return ALL_GOOD.find(x => x.id === id);
  }

  function spawnOnLane(laneIdx) {
    lanes[laneIdx].push({
      y: 0,
      ingr: pickIngredientForSpawn(),
    });
  }

  function spawnIntervalMs() {
    const base = config.BASE_SPAWN_MIN_MS +
                 randInt(config.BASE_SPAWN_MAX_MS - config.BASE_SPAWN_MIN_MS);
    const scaled = base / (1 + pizzasMade * config.SPAWN_RATE_PER_PIZZA);
    return Math.max(config.MIN_SPAWN_INTERVAL_MS, scaled);
  }

  function fallSpeedPxPerSec() {
    const scale = fieldH / 720;
    return config.BASE_FALL_SPEED * scale *
           (1 + pizzasMade * config.SPEED_PER_PIZZA);
  }

  // ----------------------------------------------------------
  // Ловля
  // ----------------------------------------------------------
  function handleCatch(laneIdx, obj) {
    const ingr = obj.ingr;

    const idx = lanes[laneIdx].indexOf(obj);
    if (idx !== -1) lanes[laneIdx].splice(idx, 1);

    if (isBad(ingr)) {
      triggerBowlFlash('bad');
      misses++;
      if (misses >= config.MAX_MISSES) over = true;
      return { event: over ? 'gameover' : 'score' };
    }

    const nextNeeded = recipe[collected.length];
    if (ingr.id !== nextNeeded) {
      triggerBowlFlash('bad');
      misses++;
      if (misses >= config.MAX_MISSES) over = true;
      return { event: over ? 'gameover' : 'score' };
    }

    triggerBowlFlash('good');
    score += config.SCORE_PER_INGREDIENT;
    collected.push(nextNeeded);

    if (collected.length === recipe.length) {
      score += config.SCORE_PER_PIZZA;
      pizzasMade++;
      pizzaAnim = { startTime: performance.now() };
      return { event: 'pizza' };
    }

    return { event: 'score' };
  }

  function checkImmediateGrab() {
    if (currentPos === 3 || over || pizzaAnim) return null;
    const lane = lanes[currentPos];
    for (let i = lane.length - 1; i >= 0; i--) {
      const obj = lane[i];
      if (obj.y > 0.90) {
        return handleCatch(currentPos, obj);
      }
    }
    return null;
  }

  // ----------------------------------------------------------
  // Tick
  // ----------------------------------------------------------
  function tick(dt) {
    if (over) return { event: null };

    if (pizzaAnim) {
      if (performance.now() - pizzaAnim.startTime > config.PIZZA_ANIM_MS) {
        pizzaAnim = null;
        newRecipe();
        if (config.RESET_POSITION_AFTER_PIZZA) {
          currentPos = 3;
        }
        return { event: 'score' };
      }
      return { event: null };
    }

    getBowlFlashState();

    const speed = fallSpeedPxPerSec();
    conveyorOffset = (conveyorOffset + (speed * dt) / 1000) % 1;

    for (let l = 0; l < config.LANE_COUNT; l++) {
      laneSpawnTimer[l] -= dt;
      if (laneSpawnTimer[l] <= 0) {
        spawnOnLane(l);
        laneSpawnTimer[l] = spawnIntervalMs();
      }
    }

    let event = null;
    for (let l = 0; l < config.LANE_COUNT; l++) {
      const lane = lanes[l];
      for (let i = lane.length - 1; i >= 0; i--) {
        const obj = lane[i];
        obj.y += (speed * dt) / 1000 / fieldH;

        if (obj.y >= 1.0) {
          if (currentPos === l) {
            const r = handleCatch(l, obj);
            if (r.event === 'gameover') return { event: 'gameover' };
            if (r.event) event = r.event;
          } else {
            lane.splice(i, 1);
          }
        }
      }
    }

    return { event };
  }

  // ----------------------------------------------------------
  // Публичные методы
  // ----------------------------------------------------------
  function reset() {
    lanes = Array.from({ length: config.LANE_COUNT }, () => []);
    laneSpawnTimer = [500, 1200, 900];
    currentPos = 3;
    score = 0;
    misses = 0;
    pizzasMade = 0;
    over = false;
    pizzaAnim = null;
    bowlFlash = null;
    conveyorOffset = 0;
    newRecipe();
    return getState();
  }

  function showPreview() {
    lanes = Array.from({ length: config.LANE_COUNT }, () => []);
    laneSpawnTimer = [Infinity, Infinity, Infinity];
    currentPos = 3;
    score = 0;
    misses = 0;
    pizzasMade = 0;
    over = false;
    pizzaAnim = null;
    bowlFlash = null;
    conveyorOffset = 0;
    newRecipe();
    return getState();
  }

  function setPosition(pos) {
    if (over || pizzaAnim) return { event: null };
    if (pos < 0 || pos > 3) return { event: null };
    currentPos = pos;
    const r = checkImmediateGrab();
    return r || { event: null };
  }

  function getScore() { return score; }
  function isOver()   { return over; }

  function getState() {
    return {
      lanes,
      currentPos,
      score,
      misses,
      pizzasMade,
      over,
      recipe,
      collected: collected.length,
      pizzaAnim: pizzaAnim
        ? {
            elapsed: performance.now() - pizzaAnim.startTime,
            duration: config.PIZZA_ANIM_MS,
          }
        : null,
      bowlFlash: getBowlFlashState(),
      conveyorOffset,
    };
  }

  lanes = Array.from({ length: config.LANE_COUNT }, () => []);
  laneSpawnTimer = [Infinity, Infinity, Infinity];
  newRecipe();

  return {
    reset,
    showPreview,
    tick,
    setPosition,
    setFieldSize,
    getScore,
    isOver,
    getState,
  };
}