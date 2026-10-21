// ============================================================
// [FILE: core/js/dom.js]
// ============================================================

export const $ = {
  canvas:      document.getElementById('gameCanvas'),
  container:   document.getElementById('canvasContainer'),

  startHint:   document.getElementById('startHint'),

  introModal:  document.getElementById('introModal'),
  introAccept: document.getElementById('introAccept'),

  limitBestScore: document.getElementById('limitBestScore'),

  introLimitMinutes: document.getElementById('introLimitMinutes'),

  // HUD-тексты (DOM-слой поверх canvas)
  hudLayer:    document.getElementById('hudLayer'),
  hudTimer:    document.getElementById('hudTimer'),
  hudMissesLabel: document.getElementById('hudMissesLabel'),
  hudMissesValue: document.getElementById('hudMissesValue'),
  hudBestLabel:   document.getElementById('hudBestLabel'),
  hudBestValue:   document.getElementById('hudBestValue'),
  hudScoreLabel:  document.getElementById('hudScoreLabel'),
  hudScoreValue:  document.getElementById('hudScoreValue'),
};


const REQUIRED = [
  'canvas',
  'container',
  'startHint',
  'introModal',
  'introAccept',
];

if (typeof console !== 'undefined') {
  for (const name of REQUIRED) {
    if (!$[name]) {
      console.warn(`[dom.js] Обязательный элемент "${name}" не найден в DOM`);
    }
  }
}