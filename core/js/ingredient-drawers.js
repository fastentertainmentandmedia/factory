// ============================================================
// [FILE: core/js/ingredient-drawers.js]
// Реестр процедурных отрисовок ингредиентов (fallback, когда
// SVG/PNG для id нет или ещё не загрузился).
//
// Контракт функции: (ctx, r, ingr) => void
//   ctx — 2D-контекст, УЖЕ переведён в центр ингредиента
//         (ctx.translate(cx, cy) сделан снаружи).
//   r   — радиус (половина size).
//   ingr — объект ингредиента (id, ...).
//
// Чтобы добавить свою пиктограмму:
//   - добавьте запись в INGREDIENT_DRAWERS;
//   - render.js НЕ трогаем.
//
// Если для id нет функции — drawProceduralIngredient нарисует
// простой круг с цветом из config.COLORS (см. render.js).
// ============================================================

export const INGREDIENT_DRAWERS = {

  dough(ctx, r) {
    ctx.fillStyle = 'rgba(160,112,64,0.5)';
    ctx.beginPath(); ctx.arc(-r*0.3, -r*0.2, r*0.15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.2, r*0.3, r*0.12, 0, Math.PI*2); ctx.fill();
  },

  tomato(ctx, r) {
    ctx.fillStyle = '#50a050';
    ctx.beginPath();
    ctx.ellipse(0, -r*0.7, r*0.3, r*0.15, 0, 0, Math.PI*2);
    ctx.fill();
  },

  cheese(ctx, r) {
    ctx.fillStyle = 'rgba(180,144,32,0.7)';
    ctx.beginPath(); ctx.arc(-r*0.25, -r*0.1, r*0.12, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.3, r*0.15, r*0.1, 0, Math.PI*2); ctx.fill();
  },

  pep(ctx, r) {
    ctx.fillStyle = 'rgba(80,20,10,0.5)';
    ctx.beginPath(); ctx.arc(-r*0.2, -r*0.2, r*0.15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.2, r*0.2, r*0.13, 0, Math.PI*2); ctx.fill();
  },

  herb(ctx, r) {
    ctx.strokeStyle = '#206020';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r*0.4, 0); ctx.lineTo(r*0.4, 0); ctx.stroke();
  },

  mush(ctx, r) {
    ctx.fillStyle = '#806040';
    ctx.beginPath();
    ctx.ellipse(0, -r*0.3, r*0.6, r*0.3, 0, Math.PI, 0);
    ctx.fill();
  },

  olive(ctx, r) {
    ctx.fillStyle = '#a0a0a0';
    ctx.beginPath(); ctx.arc(0, 0, r*0.25, 0, Math.PI*2); ctx.fill();
  },

  bacon(ctx, r) {
    ctx.strokeStyle = '#f0a080';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r*0.5, -r*0.3); ctx.lineTo(r*0.3, -r*0.1);
    ctx.moveTo(-r*0.3, r*0.1);  ctx.lineTo(r*0.5, r*0.3);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-r*0.1, -r*0.2, r*0.1, 0, Math.PI*2); ctx.fill();
  },

  pepper(ctx, r) {
    ctx.strokeStyle = '#c05010';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, r*0.5, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#f0c040';
    ctx.beginPath(); ctx.arc(0, 0, r*0.2, 0, Math.PI*2); ctx.fill();
  },

  onion(ctx, r) {
    ctx.strokeStyle = '#c0a0d0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r*0.6, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r*0.4, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r*0.2, 0, Math.PI*2); ctx.stroke();
  },

  pine(ctx, r) {
    ctx.strokeStyle = '#c0b020';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r*0.4, -r*0.4); ctx.lineTo(r*0.4, r*0.4);
    ctx.moveTo(r*0.4, -r*0.4);  ctx.lineTo(-r*0.4, r*0.4);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, r*0.12, 0, Math.PI*2); ctx.fill();
  },

  chick(ctx, r) {
    ctx.strokeStyle = '#d0a080';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r*0.5, -r*0.2); ctx.lineTo(r*0.5, -r*0.3);
    ctx.moveTo(-r*0.5, 0);      ctx.lineTo(r*0.5, -r*0.1);
    ctx.moveTo(-r*0.5, r*0.2);  ctx.lineTo(r*0.5, r*0.1);
    ctx.stroke();
  },

  ham(ctx, r) {
    ctx.fillStyle = 'rgba(255,200,200,0.7)';
    ctx.beginPath(); ctx.arc(-r*0.2, -r*0.2, r*0.15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.3, r*0.2, r*0.12, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.1, -r*0.4, r*0.1, 0, Math.PI*2); ctx.fill();
  },

  spin(ctx, r) {
    ctx.fillStyle = '#208020';
    ctx.beginPath();
    ctx.ellipse(0, 0, r*0.5, r*0.25, 0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#105010';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r*0.4, -r*0.15); ctx.lineTo(r*0.4, r*0.15); ctx.stroke();
  },

  egg(ctx, r) {
    // белок
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fffaf0';
    ctx.fill();
    ctx.strokeStyle = '#e0c060';
    ctx.lineWidth = 2;
    ctx.stroke();

    // желток
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#f7c040';
    ctx.fill();
    ctx.strokeStyle = '#c89830';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  },

  pork(ctx, r) {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = '#f0a0a0';
    ctx.fill();
    ctx.strokeStyle = '#c06060';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = '#fff5f5';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.2);
    ctx.lineTo(r * 0.6, -r * 0.4);
    ctx.moveTo(-r * 0.6, r * 0.2);
    ctx.lineTo(r * 0.6, 0);
    ctx.stroke();
  },
  cabbage(ctx, r) {
    // Слоистый зелёный «кочан»: несколько дуг от центра
    ctx.strokeStyle = '#3a7a2a';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.3 + i * 0.22), Math.PI * 0.9, Math.PI * 0.1, false);
      ctx.stroke();
    }
    // «прожилки» — короткие радиальные линии
    ctx.strokeStyle = '#b0e89a';
    ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const r1 = r * 0.2, r2 = r * 0.7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.stroke();
    }
  },

  chilli(ctx, r) {
    // Красный стручок: тело + зелёный хвостик
    ctx.fillStyle = '#d02020';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r * 0.45, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#801010';
    ctx.lineWidth = 2;
    ctx.stroke();

    // блик
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.15, -r * 0.05, r * 0.08, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // хвостик
    ctx.strokeStyle = '#2a8a2a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.6);
    ctx.lineTo(r * 0.15, -r * 0.9);
    ctx.stroke();
  },

  bad(ctx, r) {
    ctx.strokeStyle = '#400';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r*0.5, -r*0.5); ctx.lineTo(r*0.5, r*0.5);
    ctx.moveTo(r*0.5, -r*0.5);  ctx.lineTo(-r*0.5, r*0.5);
    ctx.stroke();
  },
};


// ============================================================
// [BLOCK: drawProceduralIngredient]
// Рисует процедурный ингредиент. Вызывается из render.js,
// когда для id нет загруженного SVG/PNG.
// ctx — уже переведён в центр (translate(cx, cy)).
// Если для id нет записи в реестре — рисует простой круг
// с цветом из переданных c = { color, border }.
// ============================================================

export function drawProceduralIngredient(ctx, r, ingr, c) {
  const fn = INGREDIENT_DRAWERS[ingr.id];

  if (fn) {
    fn(ctx, r, ingr);
    return;
  }

  // fallback: простой круг
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = c.color;
  ctx.fill();
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 3;
  ctx.stroke();
}