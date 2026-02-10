import { $, formatTime } from './dom-helpers.js';

let video;
let seekBar;
let timeDisplay;
let btnPlay;
let isSeeking = false;

export function initPlayerControls(videoEl) {
  video = videoEl;
  seekBar = $('#seek-bar');
  timeDisplay = $('#time-display');
  btnPlay = $('#btn-play');

  seekBar.max = video.duration;
  seekBar.value = 0;

  video.addEventListener('timeupdate', onTimeUpdate);
  video.addEventListener('play', () => { btnPlay.textContent = '⏸'; });
  video.addEventListener('pause', () => { btnPlay.textContent = '▶'; });
  video.addEventListener('ended', () => { btnPlay.textContent = '▶'; });

  seekBar.addEventListener('input', () => {
    isSeeking = true;
    video.currentTime = Number(seekBar.value);
  });

  seekBar.addEventListener('change', () => {
    isSeeking = false;
  });

  btnPlay.addEventListener('click', togglePlay);

  updateTimeDisplay();
}

function onTimeUpdate() {
  if (!isSeeking) {
    seekBar.value = video.currentTime;
  }
  updateTimeDisplay();
}

function updateTimeDisplay() {
  const current = formatTime(video ? video.currentTime : 0);
  const total = formatTime(video ? video.duration : 0);
  timeDisplay.textContent = `${current} / ${total}`;
}

export function togglePlay() {
  if (!video) return;
  if (video.paused || video.ended) {
    video.play();
  } else {
    video.pause();
  }
}

export function updateSeekBar() {
  if (!isSeeking && video) {
    seekBar.value = video.currentTime;
    updateTimeDisplay();
  }
}
