import { downloadZip } from 'client-zip';
import { getAllThumbnails, getFullBlob } from './storage.js';
import { formatTimeFilename } from './dom-helpers.js';

function getDefaultName() {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `frames_${y}${mo}${d}_${h}${mi}${s}`;
}

export async function exportZip() {
  const thumbnails = getAllThumbnails();
  if (thumbnails.length === 0) return;

  const defaultName = getDefaultName();
  const name = prompt('請輸入 ZIP 檔案名稱：', defaultName);
  if (name === null) return; // 使用者取消

  const fileName = (name.trim() || defaultName) + '.zip';

  async function* generateFiles() {
    for (let i = 0; i < thumbnails.length; i++) {
      const thumb = thumbnails[i];
      const blob = await getFullBlob(thumb.id);
      if (blob) {
        const idx = String(i + 1).padStart(4, '0');
        const timeStr = formatTimeFilename(thumb.timestamp);
        yield {
          name: `frame_${idx}_${timeStr}.png`,
          input: blob,
        };
      }
    }
  }

  const blob = await downloadZip(generateFiles()).blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
