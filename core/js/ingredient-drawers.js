// ============================================================
// [FILE: core/js/ingredient-drawers.js]
// Процедурные отрисовки (fallback, когда картинка не загрузилась).
// Контракт: (ctx, r, ingr) => void
//   ctx — уже в центре ингредиента (translate(cx,cy) снаружи)
//   r — радиус (size/2)
// ============================================================

export const INGREDIENT_DRAWERS = {

  // ---- НОВЫЕ ----
  'cabbage'(ctx, r) {
    ctx.strokeStyle = '#3a7a2a';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.3 + i * 0.22), Math.PI * 0.9, Math.PI * 0.1, false);
      ctx.stroke();
    }
    ctx.strokeStyle = '#b0e89a';
    ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
      ctx.lineTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
      ctx.stroke();
    }
  },

  'cheese'(ctx, r) {
    ctx.fillStyle = 'rgba(180,144,32,0.7)';
    ctx.beginPath(); ctx.arc(-r*0.25, -r*0.1, r*0.12, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.3, r*0.15, r*0.1, 0, Math.PI*2); ctx.fill();
  },

  'chicken'(ctx, r) {
    ctx.strokeStyle = '#c89060';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-r*0.6, i*r*0.25);
      ctx.quadraticCurveTo(0, i*r*0.35, r*0.6, i*r*0.2);
      ctx.stroke();
    }
  },

  'chilli-pepper'(ctx, r) {
    ctx.fillStyle = '#d02020';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r * 0.45, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#801010';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.15, -r * 0.05, r * 0.08, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2a8a2a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.6);
    ctx.lineTo(r * 0.15, -r * 0.9);
    ctx.stroke();
  },

  'egg'(ctx, r) {
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fffaf0';
    ctx.fill();
    ctx.strokeStyle = '#e0c060';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#f7c040';
    ctx.fill();
    ctx.strokeStyle = '#c89830';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  },

  'fish-cake'(ctx, r) {
    // Розово-белый кружок с завитком
    ctx.strokeStyle = '#e8a890';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, Math.PI, Math.PI * 2.6);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2); ctx.fill();
  },

  'mushroom'(ctx, r) {
    ctx.fillStyle = '#806040';
    ctx.beginPath();
    ctx.ellipse(0, -r*0.3, r*0.6, r*0.3, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#a08060';
    ctx.fillRect(-r*0.15, -r*0.3, r*0.3, r*0.55);
  },

  'noodle'(ctx, r) {
    // Пучок лапши: волнистые линии
    ctx.strokeStyle = '#d8b878';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * r * 0.35;
      ctx.beginPath();
      ctx.moveTo(x, -r*0.6);
      ctx.bezierCurveTo(x + r*0.2, -r*0.2, x - r*0.2, r*0.2, x, r*0.6);
      ctx.stroke();
    }
  },

  'noodle-1'(ctx, r) {
    ctx.strokeStyle = '#c8a868';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * r * 0.35;
      ctx.beginPath();
      ctx.moveTo(x, -r*0.6);
      ctx.bezierCurveTo(x - r*0.2, -r*0.2, x + r*0.2, r*0.2, x, r*0.6);
      ctx.stroke();
    }
  },

  'noodle-2'(ctx, r) {
    ctx.strokeStyle = '#b89858';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * r * 0.45;
      ctx.beginPath();
      ctx.moveTo(x, -r*0.6);
      ctx.bezierCurveTo(x + r*0.3, -r*0.1, x - r*0.3, r*0.1, x, r*0.6);
      ctx.stroke();
    }
  },

  'nori'(ctx, r) {
    // Тёмный лист нори с бликом
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.ellipse(-r*0.2, -r*0.2, r*0.35, r*0.2, -0.4, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#4a6a4a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r*0.5, r*0.2);
    ctx.lineTo(r*0.5, -r*0.2);
    ctx.stroke();
  },

  'pork'(ctx, r) {
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

  'shrimp'(ctx, r) {
    // Изогнутая креветка
    ctx.strokeStyle = '#f08060';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, Math.PI * 0.2, Math.PI * 1.5);
    ctx.stroke();

    ctx.fillStyle = '#f08060';
    ctx.beginPath();
    ctx.arc(-r*0.1, -r*0.45, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-r*0.15, -r*0.5, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
  },

  'tofu'(ctx, r) {
    // Квадратик тофу
    const s = r * 1.1;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(-s/2 + 2, -s/2 + 2, s, s);

    ctx.strokeStyle = '#c0c0a8';
    ctx.lineWidth = 2;
    ctx.strokeRect(-s/2, -s/2, s, s);

    ctx.fillStyle = 'rgba(200,200,160,0.3)';
    ctx.fillRect(-s/2 + 4, -s/2 + 4, s - 8, s - 8);
  },

  'danger'(ctx, r) {
    ctx.strokeStyle = '#400';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r*0.5, -r*0.5); ctx.lineTo(r*0.5, r*0.5);
    ctx.moveTo(r*0.5, -r*0.5);  ctx.lineTo(-r*0.5, r*0.5);
    ctx.stroke();
  },

  // ---- СТАРЫЕ (запас; не в текущем списке) ----
  'dough'(ctx, r) {
    ctx.fillStyle = 'rgba(160,112,64,0.5)';
    ctx.beginPath(); ctx.arc(-r*0.3, -r*0.2, r*0.15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.2, r*0.3, r*0.12, 0, Math.PI*2); ctx.fill();
  },
  'tomato'(ctx, r) {
    ctx.fillStyle = '#50a050';
    ctx.beginPath();
    ctx.ellipse(0, -r*0.7, r*0.3, r*0.15, 0, 0, Math.PI*2);
    ctx.fill();
  },
  'pep'(ctx, r) {
    ctx.fillStyle = 'rgba(80,20,10,0.5)';
    ctx.beginPath(); ctx.arc(-r*0.2, -r*0.2, r*0.15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.2, r*0.2, r*0.13, 0, Math.PI*2); ctx.fill();
  },
  'herb'(ctx, r) {
    ctx.strokeStyle = '#206020';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r*0.4, 0); ctx.lineTo(r*0.4, 0); ctx.stroke();
  },
  'mush'(ctx, r) {
    ctx.fillStyle = '#806040';
    ctx.beginPath();
    ctx.ellipse(0, -r*0.3, r*0.6, r*0.3, 0, Math.PI, 0);
    ctx.fill();
  },
  'olive'(ctx, r) {
    ctx.fillStyle = '#a0a0a0';
    ctx.beginPath(); ctx.arc(0, 0, r*0.25, 0, Math.PI*2); ctx.fill();
  },
  'bacon'(ctx, r) {
    ctx.strokeStyle = '#f0a080';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r*0.5, -r*0.3); ctx.lineTo(r*0.3, -r*0.1);
    ctx.moveTo(-r*0.3, r*0.1);  ctx.lineTo(r*0.5, r*0.3);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-r*0.1, -r*0.2, r*0.1, 0, Math.PI*2); ctx.fill();
  },
  'pepper'(ctx, r) {
    ctx.strokeStyle = '#c05010';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, r*0.5, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#f0c040';
    ctx.beginPath(); ctx.arc(0, 0, r*0.2, 0, Math.PI*2); ctx.fill();
  },
  'onion'(ctx, r) {
    ctx.strokeStyle = '#c0a0d0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r*0.6, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r*0.4, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r*0.2, 0, Math.PI*2); ctx.stroke();
  },
  'pine'(ctx, r) {
    ctx.strokeStyle = '#c0b020';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r*0.4, -r*0.4); ctx.lineTo(r*0.4, r*0.4);
    ctx.moveTo(r*0.4, -r*0.4);  ctx.lineTo(-r*0.4, r*0.4);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, r*0.12, 0, Math.PI*2); ctx.fill();
  },
  'chick'(ctx, r) {
    ctx.strokeStyle = '#d0a080';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r*0.5, -r*0.2); ctx.lineTo(r*0.5, -r*0.3);
    ctx.moveTo(-r*0.5, 0);      ctx.lineTo(r*0.5, -r*0.1);
    ctx.moveTo(-r*0.5, r*0.2);  ctx.lineTo(r*0.5, r*0.1);
    ctx.stroke();
  },
  'ham'(ctx, r) {
    ctx.fillStyle = 'rgba(255,200,200,0.7)';
    ctx.beginPath(); ctx.arc(-r*0.2, -r*0.2, r*0.15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.3, r*0.2, r*0.12, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.1, -r*0.4, r*0.1, 0, Math.PI*2); ctx.fill();
  },
  'spin'(ctx, r) {
    ctx.fillStyle = '#208020';
    ctx.beginPath();
    ctx.ellipse(0, 0, r*0.5, r*0.25, 0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#105010';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r*0.4, -r*0.15); ctx.lineTo(r*0.4, r*0.15); ctx.stroke();
  },
};


export function drawProceduralIngredient(ctx, r, ingr, c) {
  const fn = INGREDIENT_DRAWERS[ingr.id];

  if (fn) {
    fn(ctx, r, ingr);
    return;
  }

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = c.color;
  ctx.fill();
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 3;
  ctx.stroke();
}