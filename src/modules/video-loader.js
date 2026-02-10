import { $ } from './dom-helpers.js';

let currentObjectURL = null;

export function initVideoLoader(onVideoLoaded) {
  const dropZone = $('#drop-zone');
  const fileInput = $('#file-input');
  const video = $('#video');

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      loadVideo(file, video, onVideoLoaded);
    }
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      loadVideo(file, video, onVideoLoaded);
      fileInput.value = '';
    }
  });
}

function loadVideo(file, video, onVideoLoaded) {
  if (currentObjectURL) {
    URL.revokeObjectURL(currentObjectURL);
  }
  currentObjectURL = URL.createObjectURL(file);
  video.src = currentObjectURL;

  video.addEventListener('loadedmetadata', () => {
    onVideoLoaded(video);
  }, { once: true });
}
