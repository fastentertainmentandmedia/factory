// ============================================================
// [FILE: game/assets/goatcounter/count.js]
// ЗАГЛУШКА. Замените на реальный count.js с goatcounter.com.
// Пока определяет window.goatcounter, чтобы analytics.js
// не падал и мог отправлять события в никуда.
// ============================================================
(function () {
  if (window.goatcounter && typeof window.goatcounter.count === 'function') {
    return; // уже есть
  }
  window.goatcounter = window.goatcounter || {};
  window.goatcounter.count = function () {
    // no-op заглушка
  };
})();