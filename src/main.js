import './styles/global.css';
import { $, showNotification } from './modules/dom-helpers.js';
import { initVideoLoader } from './modules/video-loader.js';
import { initPlayerControls } from './modules/player-controls.js';
import { initFrameStepper } from './modules/frame-stepper.js';
import { captureFrame, triggerFlash } from './modules/frame-capture.js';
import { openDB, saveCaptureToStore, clearAllCaptures, hydrateFromDB, getStorageStats, getAllThumbnails } from './modules/storage.js';
import { initThumbnailStrip, addThumbnail, clearAllThumbnails } from './modules/thumbnail-strip.js';
import { exportZip } from './modules/zip-exporter.js';
import { initKeyboardShortcuts } from './modules/keyboard-shortcuts.js';
import { checkMemory, resetMemoryWarnings } from './modules/memory-monitor.js';

let videoReady = false;
let isCapturing = false;

async function init() {
  await openDB();

  const existingCaptures = await hydrateFromDB();

  initVideoLoader(onVideoLoaded);

  $('#btn-export').addEventListener('click', handleExport);
  $('#btn-clear').addEventListener('click', handleClear);

  if (existingCaptures.length > 0) {
    updateCaptureCount();
    updateButtonStates();
  }
}

function onVideoLoaded(video) {
  $('#drop-zone').classList.add('hidden');
  $('#video-container').classList.remove('hidden');
  $('#controls').classList.remove('hidden');
  $('#thumbnail-strip').classList.remove('hidden');
  $('#shortcuts-hint').classList.remove('hidden');

  const buttons = ['#btn-play', '#btn-prev-frame', '#btn-next-frame', '#btn-capture'];
  buttons.forEach(sel => $(sel).removeAttribute('disabled'));

  initPlayerControls(video);
  initFrameStepper(video);
  initThumbnailStrip(video, () => {
    updateCaptureCount();
    updateButtonStates();
  });

  hydrateExistingThumbnails();

  initKeyboardShortcuts(() => handleCapture(video));

  $('#btn-capture').addEventListener('click', () => handleCapture(video));

  videoReady = true;

  setTimeout(() => {
    $('#shortcuts-hint').classList.add('hidden');
  }, 5000);
}

function hydrateExistingThumbnails() {
  const { count } = getStorageStats();
  if (count > 0) {
    const stored = getAllThumbnails();
    stored.forEach(item => addThumbnail(item));
  }
}

async function handleCapture(video) {
  if (isCapturing || !videoReady) return;
  isCapturing = true;

  try {
    video.pause();
    triggerFlash();
    const frameData = await captureFrame(video);
    const saved = await saveCaptureToStore(frameData);
    addThumbnail(saved);
    updateCaptureCount();
    updateButtonStates();
    checkMemory();
  } catch (err) {
    showNotification('截圖失敗：' + err.message, 'danger');
  } finally {
    isCapturing = false;
  }
}

async function handleExport() {
  const btn = $('#btn-export');
  btn.disabled = true;
  btn.textContent = '匯出中...';
  try {
    await exportZip();
    showNotification('ZIP 匯出完成！', 'info');
  } catch (err) {
    showNotification('匯出失敗：' + err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.textContent = '匯出 ZIP';
    updateButtonStates();
  }
}

async function handleClear() {
  const { count } = getStorageStats();
  if (count === 0) return;
  if (!confirm(`確定要清除全部 ${count} 張截圖嗎？此操作無法復原。`)) return;

  await clearAllCaptures();
  clearAllThumbnails();
  updateCaptureCount();
  updateButtonStates();
  resetMemoryWarnings();
  showNotification('已清除全部截圖', 'info');
}

function updateCaptureCount() {
  const { count } = getStorageStats();
  $('#capture-count').textContent = `${count} 幀`;
}

function updateButtonStates() {
  const { count } = getStorageStats();
  $('#btn-export').disabled = count === 0;
  $('#btn-clear').disabled = count === 0;
}

init().catch(err => {
  console.error('Init failed:', err);
});
