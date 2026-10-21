// ============================================================
// [FILE: core/js/ui.js]
// UI на DOM сейчас минимален: hint-состояние через body[data-hint]
// и best score для hint-limit. Счёт/таймер/рекорд рисуются на canvas.
// ============================================================

import { state } from './state.js';
import { $ } from './dom.js';
import { getBestScore } from './player-limits.js';


export function createUI() {

  function render() {
    if ($.limitBestScore) {
      $.limitBestScore.textContent = getBestScore();
    }

    document.body.dataset.hint =
      state.hintVisible ? state.hintKind : 'none';
  }


  return {
    render,
  };
}