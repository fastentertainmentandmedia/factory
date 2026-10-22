// ============================================================
// [FILE: core/js/loop.js]
// ============================================================

import {
  isLimitReached,
  startSession,
  endSession,
  tickSession,
} from './player-limits.js';


export function createLoop({ rules, renderer, config, callbacks }) {

  let rafId = null;
  let active = false;
  let started = false;
  let over = false;
  let limitHit = false;

  let paused = false;
  let lastTs = 0;

  const MAX_DT = 100;

  function frame(ts) {
    if (!active || paused) return;

    if (!lastTs) lastTs = ts;
    let dt = ts - lastTs;
    lastTs = ts;

    if (dt < 0) dt = 0;
    if (dt > MAX_DT) dt = MAX_DT;

    if (isLimitReached()) {
      end('limit');
      return;
    }

    const result = rules.tick(dt);

    if (result && result.event === 'gameover') {
      renderer.render(rules.getState());
      end('gameover', { win: false, score: rules.getScore() });
      return;
    }

    if (result && (result.event === 'score' || result.event === 'combo')) {
      callbacks.onScore(rules.getScore());
    }

    renderer.render(rules.getState());

    rafId = requestAnimationFrame(frame);
  }

  function init() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (isLimitReached()) {
      callbacks.onLimit({ score: 0 });
      return;
    }

    rules.reset();

    over = false;
    active = true;
    started = true;
    limitHit = false;
    paused = false;
    lastTs = 0;

    callbacks.onScore(0);
    callbacks.onStart();

    renderer.render(rules.getState());

    startSession();
    rafId = requestAnimationFrame(frame);
  }

  function pause() {
    if (!active || paused) return;
    paused = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    renderer.render({ ...rules.getState(), paused: true });
  }

  function resume() {
    if (!active || !paused) return;
    paused = false;
    lastTs = 0;
    rafId = requestAnimationFrame(frame);
    renderer.render({ ...rules.getState(), paused: false });
  }

  function isPaused() {
    return paused;
  }

  function end(reason, payload) {
    if (!active && reason !== 'limit') return;

    active = false;
    over = true;
    paused = false;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastTs = 0;

    endSession();
    renderer.render(rules.getState());

    if (reason === 'limit') {
      limitHit = true;
      callbacks.onLimit({ score: rules.getScore() });
    } else {
      callbacks.onGameOver(payload || { win: false, score: rules.getScore() });
    }
  }

  function render() {
    renderer.render(rules.getState());
  }

  function resize(w, h, dpr) {
    renderer.resize(w, h, dpr);
    renderer.render(rules.getState());
  }

  function showPreview() {
    rules.showPreview();

    active = false;
    over = false;
    started = false;
    limitHit = false;
    paused = false;
    lastTs = 0;

    callbacks.onScore(0);
    renderer.render(rules.getState());
  }

  function setPosition(pos) {
    if (!active || over || paused) return null;

    const result = rules.setPosition(pos);

    if (result && result.event === 'gameover') {
      renderer.render(rules.getState());
      end('gameover', { win: false, score: rules.getScore() });
      return result;
    }

    if (result && (result.event === 'score' || result.event === 'combo')) {
      callbacks.onScore(rules.getScore());
    }

    renderer.render(rules.getState());
    return result;
  }

  return {
    init,
    render,
    resize,
    showPreview,
    setPosition,
    pause,
    resume,
    isPaused,

    isActive:   () => active,
    isStarted:  () => started,
    isOver:     () => over,
    isLimitHit: () => limitHit,

    tickSession: () => {
      if (active && started && !limitHit && !paused) tickSession();
    },

    flushSession: () => {
      if (active) endSession();
    },
  };
}