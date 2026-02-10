import { $, formatTime } from './dom-helpers.js';
import { deleteCapture } from './storage.js';

let video = null;
let onCountChange = null;

export function initThumbnailStrip(videoEl, countChangeCallback) {
  video = videoEl;
  onCountChange = countChangeCallback;
}

export function addThumbnail(capture) {
  const list = $('#thumbnail-list');

  const item = document.createElement('div');
  item.className = 'thumb-item';
  item.dataset.id = capture.id;
  item.dataset.timestamp = capture.timestamp;
  item.setAttribute('role', 'listitem');

  const img = document.createElement('img');
  img.src = capture.thumbBlobUrl;
  img.alt = `幀 ${formatTime(capture.timestamp)}`;

  const timeLabel = document.createElement('div');
  timeLabel.className = 'thumb-time';
  timeLabel.textContent = formatTime(capture.timestamp);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'thumb-delete';
  deleteBtn.textContent = '✕';
  deleteBtn.setAttribute('aria-label', `刪除幀 ${formatTime(capture.timestamp)}`);

  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await deleteCapture(capture.id);
    item.remove();
    if (onCountChange) onCountChange();
  });

  item.addEventListener('click', () => {
    if (video) {
      video.currentTime = capture.timestamp;
    }
  });

  item.appendChild(img);
  item.appendChild(timeLabel);
  item.appendChild(deleteBtn);
  list.appendChild(item);

  list.scrollLeft = list.scrollWidth;
}

export function clearAllThumbnails() {
  const list = $('#thumbnail-list');
  list.innerHTML = '';
}

export function getThumbnailCount() {
  return $('#thumbnail-list').children.length;
}
