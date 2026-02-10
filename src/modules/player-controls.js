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
  const iconPlay = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4.75v14.5a.75.75 0 001.15.63l11.5-7.25a.75.75 0 000-1.26L7.15 4.12A.75.75 0 006 4.75z"/></svg>';
  const iconPause = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
  video.addEventListener('play', () => { btnPlay.innerHTML = iconPause; });
  video.addEventListener('pause', () => { btnPlay.innerHTML = iconPlay; });
  video.addEventListener('ended', () => { btnPlay.innerHTML = iconPlay; });

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
