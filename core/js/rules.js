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
  let combosMade = 0;
  let over = false;

  let recipe = [];
  let collected = [];

  let comboAnim = null;
  let bowlFlash = null;
  let conveyorOffset = 0;

  let recentSpawns = [];

  let fieldW = 520;
  let fieldH = 720;

  function setFieldSize(w, h) {
    fieldW = w;
    fieldH = h;
  }

  // ----------------------------------------------------------
  // Рецепт
  // ----------------------------------------------------------
  function newRecipe() {
    const len = config.MIN_RECIPE_LEN +
                randInt(config.MAX_RECIPE_LEN - config.MIN_RECIPE_LEN + 1);

    const starterPool = STARTER_GROUP
      .map(id => ALL_GOOD.find(x => x.id === id))
      .filter(Boolean);

    const starterTake = Math.min(STARTER_COUNT, starterPool.length, len);
    const starters = shuffle(starterPool).slice(0, starterTake);

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
  // Anti-repeat
  // ----------------------------------------------------------
  function pushRecentSpawn(id) {
    const n = config.SPAWN_ANTI_REPEAT || 0;
    if (n <= 0) return;
    recentSpawns.push(id);
    while (recentSpawns.length > n) recentSpawns.shift();
  }

  function lastOnLane(laneIdx) {
    const lane = lanes[laneIdx];
    if (!lane || lane.length === 0) return null;
    return lane[lane.length - 1].ingr.id;
  }

  // ----------------------------------------------------------
  // Спавн
  // ----------------------------------------------------------
  function pickIngredientForSpawn(laneIdx) {
    if (Math.random() < config.BAD_INGREDIENT_CHANCE) return BAD_INGREDIENT;

    const remaining = recipe.slice(collected.length);
    const neededSet = new Set(remaining);

    let pool;
    const wantExtra = Math.random() < (config.EXTRA_SPAWN_CHANCE || 0);

    if (wantExtra && ALL_GOOD.length > remaining.length) {
      pool = ALL_GOOD.filter(x => !neededSet.has(x.id));
      if (pool.length === 0) pool = ALL_GOOD.slice();
    } else if (remaining.length > 0) {
      pool = remaining.map(id => ALL_GOOD.find(x => x.id === id)).filter(Boolean);
    } else {
      pool = ALL_GOOD.slice();
    }

    const n = config.SPAWN_ANTI_REPEAT || 0;
    if (n > 0 && recentSpawns.length > 0) {
      const banned = new Set(recentSpawns);
      const filtered = pool.filter(x => !banned.has(x.id));
      if (filtered.length > 0) pool = filtered;
    }

    const perLane = config.SPAWN_ANTI_REPEAT_PER_LANE || 0;
    if (perLane > 0 && laneIdx != null) {
      const lastId = lastOnLane(laneIdx);
      if (lastId) {
        const filtered = pool.filter(x => x.id !== lastId);
        if (filtered.length > 0) pool = filtered;
      }
    }

    return pick(pool);
  }

  function spawnOnLane(laneIdx) {
    const ingr = pickIngredientForSpawn(laneIdx);
    lanes[laneIdx].push({ y: 0, ingr });
    pushRecentSpawn(ingr.id);
  }

  function spawnIntervalMs() {
    const base = config.BASE_SPAWN_MIN_MS +
                 randInt(config.BASE_SPAWN_MAX_MS - config.BASE_SPAWN_MIN_MS);
    const scaled = base / (1 + combosMade * config.SPAWN_RATE_PER_COMBO);
    return Math.max(config.MIN_SPAWN_INTERVAL_MS, scaled);
  }

  function fallSpeedPxPerSec() {
    const scale = fieldH / 720;
    return config.BASE_FALL_SPEED * scale *
           (1 + combosMade * config.SPEED_PER_COMBO);
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
      if (config.BAD_INSTANT_GAME_OVER) {
        over = true;
        return { event: 'gameover' };
      }
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
      score += config.SCORE_PER_COMBO;
      combosMade++;
      comboAnim = { startTime: performance.now() };
      return { event: 'combo' };
    }

    return { event: 'score' };
  }

  function checkImmediateGrab() {
    if (currentPos === 3 || over || comboAnim) return null;
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

    if (comboAnim) {
      if (performance.now() - comboAnim.startTime > config.COMBO_ANIM_MS) {
        comboAnim = null;
        newRecipe();
        if (config.RESET_POSITION_AFTER_COMBO) {
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
    combosMade = 0;
    over = false;
    comboAnim = null;
    bowlFlash = null;
    conveyorOffset = 0;
    recentSpawns = [];
    newRecipe();
    return getState();
  }

  function showPreview() {
    lanes = Array.from({ length: config.LANE_COUNT }, () => []);
    laneSpawnTimer = [Infinity, Infinity, Infinity];
    currentPos = 3;
    score = 0;
    misses = 0;
    combosMade = 0;
    over = false;
    comboAnim = null;
    bowlFlash = null;
    conveyorOffset = 0;
    recentSpawns = [];
    newRecipe();
    return getState();
  }

  function setPosition(pos) {
    if (over || comboAnim) return { event: null };
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
      combosMade,
      over,
      recipe,
      collected: collected.length,
      comboAnim: comboAnim
        ? {
            elapsed: performance.now() - comboAnim.startTime,
            duration: config.COMBO_ANIM_MS,
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