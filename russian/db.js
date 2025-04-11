// db.js
const DB_NAME = 'dictionaryDB';
const DB_VERSION = 2; // <-- bumped version for bookmarks
const STORE_NAME = 'words';
const BOOKMARKS_STORE = 'bookmarks';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BOOKMARKS_STORE)) {
        db.createObjectStore(BOOKMARKS_STORE, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadJSONOnce() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const countRequest = store.count();
  
  return new Promise((resolve, reject) => {
    countRequest.onsuccess = async () => {
      if (countRequest.result > 0) return resolve(); // already loaded
      
      const res = await fetch('/russian/dictionary_ru.json');
      const data = await res.json();
      
      const txWrite = db.transaction(STORE_NAME, 'readwrite');
      const storeWrite = txWrite.objectStore(STORE_NAME);
      data.forEach(item => storeWrite.put(item));
      
      txWrite.oncomplete = resolve;
      txWrite.onerror = reject;
    };
    countRequest.onerror = reject;
  });
}

async function searchWords(query) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  
  return new Promise((resolve) => {
    const results = [];
    const request = store.openCursor();
    
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const { en, ru } = cursor.value;
        const lowerQuery = query.toLowerCase();
        if (en.toLowerCase().includes(lowerQuery) || ru.toLowerCase().includes(lowerQuery)) {
          results.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };
  });
}

async function getWordById(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve) => {
    const request = store.get(Number(id));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function getAllWords() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve) => {
    const results = [];
    const request = store.openCursor();
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
  });
}

// BOOKMARK FUNCTIONS
async function addBookmark(word) {
  const db = await openDB();
  const tx = db.transaction(BOOKMARKS_STORE, 'readwrite');
  tx.objectStore(BOOKMARKS_STORE).put(word);
  return tx.complete;
}

async function checkBookmark(id) {
  const db = await openDB();
  const tx = db.transaction(BOOKMARKS_STORE, 'readonly');
  const request = tx.objectStore(BOOKMARKS_STORE).get(Number(id));
  return new Promise(res => {
    request.onsuccess = () => res(!!request.result);
    request.onerror = () => res(false);
  });
}

async function getBookmarks() {
  const db = await openDB();
  const tx = db.transaction(BOOKMARKS_STORE, 'readonly');
  const store = tx.objectStore(BOOKMARKS_STORE);
  return new Promise(resolve => {
    const results = [];
    const request = store.openCursor();
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
  });
}