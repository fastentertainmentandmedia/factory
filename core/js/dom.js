// ============================================================
// [FILE: core/js/dom.js]
// Кэш DOM-элементов. Обязательные — обязаны быть в index.html.
// Необязательные — допускают отсутствие (ui.js это учитывает).
// ============================================================

export const $ = {
  canvas:      document.getElementById('gameCanvas'),
  container:   document.getElementById('canvasContainer'),

  startHint:   document.getElementById('startHint'),

  introModal:  document.getElementById('introModal'),
  introAccept: document.getElementById('introAccept'),

  limitBestScore: document.getElementById('limitBestScore'),

  introLimitMinutes: document.getElementById('introLimitMinutes'),
};


// Обязательные для работы игры — предупреждаем только по ним.
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