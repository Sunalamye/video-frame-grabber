import { $ } from './dom-helpers.js';
import { DEFAULT_FPS, FPS_SAMPLE_COUNT, FRAME_STEP_EPSILON } from '../constants.js';
import { updateSeekBar } from './player-controls.js';

let video;
let detectedFPS = DEFAULT_FPS;
let isStepping = false;

export function initFrameStepper(videoEl) {
  video = videoEl;
  $('#btn-prev-frame').addEventListener('click', stepBackward);
  $('#btn-next-frame').addEventListener('click', stepForward);
  detectFPS(videoEl);
}

export function getFPS() {
  return detectedFPS;
}

function detectFPS(videoEl) {
  if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) {
    detectedFPS = DEFAULT_FPS;
    updateFPSDisplay();
    return;
  }

  const timestamps = [];
  let detecting = false;

  function onFrame(now, metadata) {
    timestamps.push(metadata.mediaTime);

    if (timestamps.length >= FPS_SAMPLE_COUNT + 1) {
      const diffs = [];
      for (let i = 1; i < timestamps.length; i++) {
        const diff = timestamps[i] - timestamps[i - 1];
        if (diff > 0) diffs.push(diff);
      }
      if (diffs.length > 0) {
        const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        detectedFPS = Math.round(1 / avgDiff);
        if (detectedFPS < 1 || detectedFPS > 240) detectedFPS = DEFAULT_FPS;
      }
      videoEl.pause();
      videoEl.currentTime = 0;
      detecting = false;
      updateFPSDisplay();
      return;
    }

    videoEl.requestVideoFrameCallback(onFrame);
  }

  videoEl.addEventListener('canplay', () => {
    if (detecting) return;
    detecting = true;
    const wasTime = videoEl.currentTime;
    videoEl.muted = true;
    videoEl.requestVideoFrameCallback(onFrame);
    videoEl.play().catch(() => {
      detectedFPS = DEFAULT_FPS;
      detecting = false;
      updateFPSDisplay();
    });
  }, { once: true });
}

function updateFPSDisplay() {
  const fpsDisplay = $('#fps-display');
  fpsDisplay.textContent = `${detectedFPS} FPS`;
}

export function stepForward() {
  if (!video || isStepping) return;
  video.pause();
  isStepping = true;
  const step = 1 / detectedFPS + FRAME_STEP_EPSILON;
  const target = Math.min(video.currentTime + step, video.duration);
  video.currentTime = target;
  video.addEventListener('seeked', () => {
    isStepping = false;
    updateSeekBar();
  }, { once: true });
}

export function stepBackward() {
  if (!video || isStepping) return;
  video.pause();
  isStepping = true;
  const step = 1 / detectedFPS + FRAME_STEP_EPSILON;
  const target = Math.max(video.currentTime - step, 0);
  video.currentTime = target;
  video.addEventListener('seeked', () => {
    isStepping = false;
    updateSeekBar();
  }, { once: true });
}
