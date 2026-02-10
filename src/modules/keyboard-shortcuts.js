import { togglePlay } from './player-controls.js';
import { stepForward, stepBackward } from './frame-stepper.js';

let captureCallback = null;

export function initKeyboardShortcuts(onCapture) {
  captureCallback = onCapture;

  document.addEventListener('keydown', handleKeydown);
}

function handleKeydown(e) {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      togglePlay();
      break;
    case 'ArrowRight':
      e.preventDefault();
      stepForward();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      stepBackward();
      break;
    case 'KeyS':
      e.preventDefault();
      if (captureCallback) captureCallback();
      break;
  }
}
