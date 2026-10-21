// ============================================================
// [FILE: core/js/main.js]
// Точка входа. Собирает core + game (Pizza Catch).
// ============================================================

import {
  initPlayer,
  isLimitReached,
  flushSession,
  getBestScore,
  updateBestScore,
  isReturning,
} from './player-limits.js';

import { trackGoal, getClient } from './analytics.js';

import { state, updateState, resetGameState } from './state.js';
import { $ } from './dom.js';
import { createUI }         from './ui.js';
import { createLoop }       from './loop.js';
import { createResize }     from './resize.js';
import { createLifecycle }  from './lifecycle.js';
import { createIntro }      from './intro.js';

import { config }       from './config.js';
import { gameConfig }   from '../../game/js/config.js';
import { createRules }    from './rules.js';
import { createRenderer } from './render.js';
import { createTapZones } from './controls/tap-zones.js';


// ============================================================
// [BLOCK: disable-double-tap-zoom]
// ============================================================

let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) event.preventDefault();
  lastTouchEnd = now;
}, { passive: false });


// ============================================================
// [BLOCK: preloader]
// ============================================================

function hidePreloader() {
  document.documentElement.classList.add('ready');
}


// ============================================================
// [BLOCK: goatcounter]
// ============================================================

(function loadGoatCounter() {
  window.goatcounter = { allow_local: true };

  const script = document.createElement('script');
  script.async = true;
  script.src = gameConfig.ASSETS.goatcounter;
  script.setAttribute(
    'data-goatcounter',
    'https://fastentertainmentandmedia.goatcounter.com/count'
  );
  script.setAttribute(
    'data-goatcounter-settings',
    '{"allow_local": true}'
  );

  document.head.appendChild(script);
})();


// ============================================================
// [BLOCK: metrika]
// ============================================================

(function loadMetrika() {
  let loaded = false;

  function init() {
    if (loaded) return;
    loaded = true;

    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) { return; }
      }
      k=e.createElement(t), a=e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=113332587', 'ym');

    window.ym(113332587, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  }

  const onInteraction = () => {
    document.removeEventListener('pointerdown', onInteraction);
    document.removeEventListener('keydown', onInteraction);
    setTimeout(init, 500);
  };
  document.addEventListener('pointerdown', onInteraction, { once: true });
  document.addEventListener('keydown', onInteraction, { once: true });

  window.addEventListener('load', () => {
    setTimeout(init, 5000);
  }, { once: true });
})();


// ============================================================
// [BLOCK: session-counter]
// ============================================================

let gamesThisSession = 0;


// ============================================================
// [BLOCK: init]
// ============================================================

initPlayer();

state.bestScore = getBestScore();

const isReturningPlayer = isReturning();
const client = getClient();

trackGoal('game_loaded', {
  type: isReturningPlayer ? 'returning' : 'new',
  client: client,
});

const ui = createUI();
const rules = createRules();
const renderer = createRenderer($.canvas, {
  onImageReady: () => game && game.render(),
});

rules.setFieldSize($.canvas.width, $.canvas.height);


const game = createLoop({
  rules,
  renderer,
  config,
  callbacks: {
    onScore: score => updateState({ score }, ui),

    onStart: () => {
      gamesThisSession++;

      trackGoal('game_start', { number: gamesThisSession });

      updateState({
        gameStarted: true,
        gameActive: true,
        gameOver: false,
        hintVisible: false,
      }, ui);
    },

    onGameOver: ({ win, score }) => {
      const isNewRecord = updateBestScore(score);

      trackGoal('game_over', {
        score,
        win: win ? 1 : 0,
        number: gamesThisSession,
      });

      updateState({
        gameActive: false,
        gameStarted: true,
        gameOver: true,
        win: !!win,
        ...(isNewRecord ? { bestScore: score } : {}),
      }, ui);
    },

    onLimit: ({ score = 0 } = {}) => {
      const isNewRecord = score > 0 && updateBestScore(score);

      trackGoal('daily_limit_reached', {
        score,
        number: gamesThisSession,
      });

      updateState({
        limitReached: true,
        hintVisible: true,
        hintKind: 'limit',
        ...(isNewRecord ? { bestScore: score } : {}),
      }, ui);
    },
  },
});


// ============================================================
// [BLOCK: tap-zones]
// ============================================================

const tapZones = createTapZones($.canvas, {
  getZones: () => renderer.getTapZones(),

  onPosition: (pos) => {
    if (!state.gameUnlocked) return;
    if (state.limitReached) return;

    if (state.gameOver) return;
    if (!state.gameStarted) return;

    game.setPosition(pos);
  },

  onTapOutside: () => {
    if (!state.gameUnlocked) return;
    if (state.limitReached) return;

    if (state.gameOver || !state.gameStarted) {
      startNewGame();
    }
  },
});


// ============================================================
// [BLOCK: startNewGame]
// ============================================================

function startNewGame() {
  if (state.gameActive) flushSession();
  resetGameState();
  state.score = 0;
  ui.render();
  game.init();
}


// ============================================================
// [BLOCK: resize]
// ============================================================

createResize({
  canvas: $.canvas,
  onResize: (w, h) => {
    rules.setFieldSize(w, h);
    renderer.resize(w, h);
    game.render();
  },
});


// ============================================================
// [BLOCK: unlock]
// ============================================================

function unlockGame() {
  if (state.gameUnlocked) return;

  updateState({
    gameUnlocked: true,
    cookiesAccepted: true,
  }, ui);

  tapZones.enable();

  if (isLimitReached()) {
    updateState({
      limitReached: true,
      hintVisible: true,
      hintKind: 'limit',
    }, ui);
  } else {
    game.showPreview();
    updateState({
      hintVisible: true,
      hintKind: 'start',
      gameStarted: false,
      gameActive: false,
      gameOver: false,
    }, ui);
  }

  ui.render();
}


const intro = createIntro({ onAccept: unlockGame });

hidePreloader();
intro.init();


// ============================================================
// [BLOCK: session-tick]
// Раз в секунду начисляем потраченное время (для лимита).
// Таймер на canvas читает getRemainingMs() на каждом кадре.
// ============================================================

setInterval(() => {
  if (!state.gameUnlocked) return;

  if (!state.gameActive && !state.gameStarted && isLimitReached()) {
    updateState({
      limitReached: true,
      hintVisible: true,
      hintKind: 'limit',
    }, ui);
  }

  game.tickSession();
}, 1000);


// ============================================================
// [BLOCK: lifecycle]
// ============================================================

createLifecycle({
  isActive: () => state.gameActive,
  onFlush: flushSession,
  onHide: () => {
    game.flushSession();
    game.render();
  },
});


// ============================================================
// [BLOCK: contextmenu]
// ============================================================

$.canvas.addEventListener('contextmenu', e => e.preventDefault());


// ============================================================
// [BLOCK: debug-reset-limit]
// ============================================================

(function debugResetLimit() {
  const isDev =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:';

  if (!isDev) return;

  const params = new URLSearchParams(location.search);
  if (params.get('resetLimit') === '1') {
    try { localStorage.removeItem(gameConfig.STORAGE_KEY); } catch (e) {}

    params.delete('resetLimit');
    const newUrl = location.pathname + (params.toString() ? '?' + params : '');
    history.replaceState({}, '', newUrl);

    console.log('%climit dropped',
      'color:#ff6b1a;font-weight:bold;font-size:14px');

    location.reload();
  }
})();