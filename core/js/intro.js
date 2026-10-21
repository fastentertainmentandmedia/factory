// ============================================================
// [FILE: core/js/intro.js]
// ============================================================

import { gameConfig as config } from '../../game/js/config.js';
import { trackGoal } from './analytics.js';
import { $ } from './dom.js';

const ACCEPT_KEY_SUFFIX = '_intro_accepted';
const HIDE_ANIMATION_MS = 350;


export function createIntro({ onAccept }) {

  const modal     = $.introModal;
  const acceptBtn = $.introAccept;

  if ($.introLimitMinutes) {
    $.introLimitMinutes.textContent = config.PLAY_LIMIT_MINUTES;
  }

  const acceptKey = config.STORAGE_KEY + ACCEPT_KEY_SUFFIX;

  let alreadyAccepted = false;
  try {
    alreadyAccepted = localStorage.getItem(acceptKey) === '1';
  } catch (e) {
    alreadyAccepted = false;
  }


  function hideModal() {
    modal.classList.add('hidden');
    setTimeout(() => {
      modal.style.display = 'none';
    }, HIDE_ANIMATION_MS);
  }


  function accept() {
    try {
      localStorage.setItem(acceptKey, '1');
    } catch (e) {}

    trackGoal('cookie_accepted');

    hideModal();
    onAccept();
  }


  function init() {
    if (alreadyAccepted) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
      onAccept();
      return;
    }

    modal.classList.remove('hidden');
    modal.style.display = '';
    acceptBtn.addEventListener('click', accept);
  }


  return {
    init,
    accept,
    isAccepted: () => alreadyAccepted,
  };
}