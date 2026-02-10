import { $ } from './dom-helpers.js';
import { THUMB_WIDTH, THUMB_HEIGHT, THUMB_QUALITY, FLASH_DURATION_MS } from '../constants.js';

let fullCanvas = null;
let fullCtx = null;
let thumbCanvas = null;
let thumbCtx = null;

function ensureCanvases(width, height) {
  if (typeof OffscreenCanvas !== 'undefined') {
    if (!fullCanvas || fullCanvas.width !== width || fullCanvas.height !== height) {
      fullCanvas = new OffscreenCanvas(width, height);
      fullCtx = fullCanvas.getContext('2d');
    }
    if (!thumbCanvas) {
      thumbCanvas = new OffscreenCanvas(THUMB_WIDTH, THUMB_HEIGHT);
      thumbCtx = thumbCanvas.getContext('2d');
    }
  } else {
    if (!fullCanvas) {
      fullCanvas = document.createElement('canvas');
      fullCtx = fullCanvas.getContext('2d');
    }
    fullCanvas.width = width;
    fullCanvas.height = height;
    if (!thumbCanvas) {
      thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = THUMB_WIDTH;
      thumbCanvas.height = THUMB_HEIGHT;
      thumbCtx = thumbCanvas.getContext('2d');
    }
  }
}

export async function captureFrame(video) {
  const { videoWidth, videoHeight } = video;
  ensureCanvases(videoWidth, videoHeight);

  fullCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
  thumbCtx.drawImage(video, 0, 0, THUMB_WIDTH, THUMB_HEIGHT);

  let fullBlob, thumbBlob;

  if (fullCanvas instanceof OffscreenCanvas) {
    fullBlob = await fullCanvas.convertToBlob({ type: 'image/png' });
    thumbBlob = await thumbCanvas.convertToBlob({ type: 'image/jpeg', quality: THUMB_QUALITY });
  } else {
    fullBlob = await new Promise(resolve => fullCanvas.toBlob(resolve, 'image/png'));
    thumbBlob = await new Promise(resolve => thumbCanvas.toBlob(resolve, 'image/jpeg', THUMB_QUALITY));
  }

  return {
    fullBlob,
    thumbBlob,
    width: videoWidth,
    height: videoHeight,
    timestamp: video.currentTime,
    fileSize: fullBlob.size,
  };
}

export function triggerFlash() {
  const overlay = $('#flash-overlay');
  overlay.classList.add('flash-active');
  setTimeout(() => {
    overlay.classList.remove('flash-active');
  }, FLASH_DURATION_MS);
}
