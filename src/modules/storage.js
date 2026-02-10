import { DB_NAME, DB_VERSION, STORE_NAME } from '../constants.js';

let db = null;
const memoryStore = new Map();

export async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

export async function saveCaptureToStore(capture) {
  const id = crypto.randomUUID();
  const record = {
    id,
    fullBlob: capture.fullBlob,
    thumbBlob: capture.thumbBlob,
    timestamp: capture.timestamp,
    width: capture.width,
    height: capture.height,
    fileSize: capture.fileSize,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(record);

    tx.oncomplete = () => {
      const thumbBlobUrl = URL.createObjectURL(capture.thumbBlob);
      memoryStore.set(id, {
        thumbBlobUrl,
        timestamp: capture.timestamp,
        fileSize: capture.fileSize,
        createdAt: record.createdAt,
      });
      resolve({ id, thumbBlobUrl, ...record });
    };

    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function deleteCapture(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);

    tx.oncomplete = () => {
      const entry = memoryStore.get(id);
      if (entry) {
        URL.revokeObjectURL(entry.thumbBlobUrl);
        memoryStore.delete(id);
      }
      resolve();
    };

    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function clearAllCaptures() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();

    tx.oncomplete = () => {
      for (const entry of memoryStore.values()) {
        URL.revokeObjectURL(entry.thumbBlobUrl);
      }
      memoryStore.clear();
      resolve();
    };

    tx.onerror = (e) => reject(e.target.error);
  });
}

export function getAllThumbnails() {
  return Array.from(memoryStore.entries()).map(([id, data]) => ({
    id,
    ...data,
  })).sort((a, b) => a.createdAt - b.createdAt);
}

export async function getFullBlob(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);

    request.onsuccess = () => {
      resolve(request.result ? request.result.fullBlob : null);
    };

    request.onerror = (e) => reject(e.target.error);
  });
}

export function getStorageStats() {
  let totalSize = 0;
  let count = 0;
  for (const entry of memoryStore.values()) {
    totalSize += entry.fileSize;
    count++;
  }
  return { count, totalSizeMB: totalSize / (1024 * 1024) };
}

export async function hydrateFromDB() {
  if (!db) await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.openCursor();

    const results = [];

    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const record = cursor.value;
        const thumbBlobUrl = URL.createObjectURL(record.thumbBlob);
        memoryStore.set(record.id, {
          thumbBlobUrl,
          timestamp: record.timestamp,
          fileSize: record.fileSize,
          createdAt: record.createdAt,
        });
        results.push({
          id: record.id,
          thumbBlobUrl,
          timestamp: record.timestamp,
          fileSize: record.fileSize,
          createdAt: record.createdAt,
        });
        cursor.continue();
      }
    };

    tx.oncomplete = () => {
      results.sort((a, b) => a.createdAt - b.createdAt);
      resolve(results);
    };

    tx.onerror = (e) => reject(e.target.error);
  });
}
