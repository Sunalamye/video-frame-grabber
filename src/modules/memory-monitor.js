import { showNotification } from './dom-helpers.js';
import { getStorageStats } from './storage.js';
import {
  WARN_LIGHT_COUNT,
  WARN_MEDIUM_COUNT,
  WARN_MEDIUM_SIZE_MB,
  WARN_HEAVY_SIZE_MB,
} from '../constants.js';

let lastWarnLevel = 0;

export function checkMemory() {
  const { count, totalSizeMB } = getStorageStats();
  let level = 0;

  if (totalSizeMB >= WARN_HEAVY_SIZE_MB) {
    level = 3;
  } else if (count >= WARN_MEDIUM_COUNT || totalSizeMB >= WARN_MEDIUM_SIZE_MB) {
    level = 2;
  } else if (count >= WARN_LIGHT_COUNT) {
    level = 1;
  }

  if (level > lastWarnLevel) {
    if (level === 1) {
      showNotification(
        `已截取 ${count} 幀。截取過多可能影響效能。`,
        'info',
        4000
      );
    } else if (level === 2) {
      showNotification(
        `已使用 ${totalSizeMB.toFixed(0)} MB（${count} 幀）。建議匯出後清除以釋放空間。`,
        'warning',
        6000
      );
    } else if (level === 3) {
      showNotification(
        `儲存已超過 ${WARN_HEAVY_SIZE_MB} MB！請立即匯出並清除，以避免瀏覽器崩潰。`,
        'danger',
        10000
      );
    }
    lastWarnLevel = level;
  }
}

export function resetMemoryWarnings() {
  lastWarnLevel = 0;
}
