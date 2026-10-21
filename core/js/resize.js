// ============================================================
// [FILE: core/js/resize.js]
// Синхронизация размеров canvas с CSS-размером контейнера.
// HiDPI: canvas.width = cssW * dpr, CSS-размер = cssW.
// onResize получает ЛОГИЧЕСКИЕ (CSS) размеры и dpr.
// ============================================================

import { config } from './config.js';


export function createResize({ canvas, onResize }) {

  let raf = null;
  let observer = null;

  function sync() {
    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cssW = Math.round(rect.width);
    const cssH = Math.round(rect.height);

    if (cssW <= 0 || cssH <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, config.MAX_DPR || 1);
    const pixelW = Math.round(cssW * dpr);
    const pixelH = Math.round(cssH * dpr);

    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
      // CSS-размер = логический размер
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
      onResize(cssW, cssH, dpr);
    }
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      sync();
    });
  }

  observer = new ResizeObserver(schedule);
  observer.observe(canvas.parentElement);

  sync();
  requestAnimationFrame(sync);
  setTimeout(sync, 100);

  return {
    sync,
    destroy() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    },
  };
}