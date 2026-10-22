// ============================================================
// [FILE: core/js/ui.js]
// UI на DOM: hint-состояние, best для hint-limit,
// HUD-тексты (таймер/промахи/рекорд/счёт).
// ============================================================

import { state } from './state.js';
import { $ } from './dom.js';
import { getBestScore, getRemainingMs } from './player-limits.js';
import { config } from './config.js';
import { gameConfig } from '../../game/js/config.js';


export function createUI() {

  let timerInterval = null;
  let hudFontBaseH = 720;   // для пересчёта --hud-font-size

  function formatTimer(ms) {
    const totalSec = Math.ceil(Math.max(0, ms) / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function render() {
    if ($.limitBestScore) {
      $.limitBestScore.textContent = getBestScore();
    }

    document.body.dataset.hint =
      state.hintVisible ? state.hintKind : 'none';

    // HUD: промахи
    if ($.hudMissesValue) {
      $.hudMissesValue.textContent = `${state.misses}/${config.MAX_MISSES}`;
      $.hudMissesValue.classList.toggle(
        'is-danger',
        state.misses >= config.MAX_MISSES - 1
      );
    }

    // HUD: рекорд
    if ($.hudBestValue) {
      $.hudBestValue.textContent = String(getBestScore());
    }

    // HUD: счёт
    if ($.hudScoreValue) {
      $.hudScoreValue.textContent = String(state.score);
    }
  }

  function updateTimer() {
    const ms = getRemainingMs();

    if ($.hudTimer) {
      $.hudTimer.textContent = formatTimer(ms);

      const limitMs = Math.max(1, gameConfig.PLAY_LIMIT_MINUTES * 60 * 1000);
      const ratio = ms / limitMs;

      $.hudTimer.classList.remove('is-warning', 'is-danger', 'is-critical');

      if (ratio <= config.TIMER_CRITICAL_RATIO) {
        $.hudTimer.classList.add('is-critical');
      } else if (ratio <= config.TIMER_DANGER_RATIO) {
        $.hudTimer.classList.add('is-danger');
      } else if (ratio <= config.TIMER_WARN_RATIO) {
        $.hudTimer.classList.add('is-warning');
      }
    }
  }

  function startTimer(onTick) {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      onTick();
      updateTimer();
    }, 1000);
    updateTimer();
  }

  // Пересчёт базового размера шрифта HUD при изменении H.
  function setHudFontSize(w, h) {
    if (!$.hudLayer) return;
    hudFontBaseH = h;

    // База — от ШИРИНЫ поля (диапазон уже, чем у высоты).
    // Ограничение 12..20 px сглаживает крайности.
    const raw = w * 0.030;
    const px = Math.round(Math.min(20, Math.max(12, raw)));

    $.hudLayer.style.setProperty('--hud-font-size', px + 'px');
  }

  return {
    render,
    updateTimer,
    startTimer,
    setHudFontSize,
  };
}