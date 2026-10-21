// ============================================================
// [FILE: core/js/controls/tap-zones.js]
// Тап по круглым зонам на canvas.
// HiDPI: canvas.width = cssW * dpr, но логические координаты
// зон — в CSS-пикселях. Поэтому clientX/Y → CSS-пиксели
// через rect (без масштабирования на dpr).
// ============================================================

const TAP_MARKER_DURATION_MS = 400;


export function createTapZones(canvas, callbacks) {

  const getZones      = callbacks.getZones;
  const onPosition    = callbacks.onPosition ?? (() => {});
  const onTapOutside  = callbacks.onTapOutside ?? (() => {});

  let enabled = false;
  let marker = null;

  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    // canvas CSS-размер = логический (см. resize.js)
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function hitTest(x, y) {
    const zones = getZones();
    for (const z of zones) {
      const dx = x - z.x;
      const dy = y - z.y;
      const r = z.radius;
      if (dx * dx + dy * dy <= r * r) return z;
    }
    return null;
  }

  function handleTap(clientX, clientY) {
    if (!enabled) return;

    const { x, y } = toLogical(clientX, clientY);
    marker = { x, y, startTime: performance.now() };

    const zone = hitTest(x, y);
    if (zone) {
      onPosition(zone.pos);
    } else {
      onTapOutside(x, y);
    }
  }

  function handlePointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    handleTap(e.clientX, e.clientY);
  }

  function handleTouchStart(e) {
    if (e.touches.length === 0) return;
    e.preventDefault();
    const t = e.touches[0];
    handleTap(t.clientX, t.clientY);
  }

  const supportsPointer = typeof window !== 'undefined' && 'PointerEvent' in window;

  if (supportsPointer) {
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
  } else {
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  }

  function getMarker() {
    if (!marker) return null;
    if (performance.now() - marker.startTime > TAP_MARKER_DURATION_MS) {
      marker = null;
      return null;
    }
    return marker;
  }

  return {
    enable()   { enabled = true; },
    disable()  { enabled = false; },
    isEnabled: () => enabled,
    getMarker,

    destroy() {
      if (supportsPointer) {
        canvas.removeEventListener('pointerdown', handlePointerDown);
      } else {
        canvas.removeEventListener('touchstart', handleTouchStart);
      }
    },
  };
}