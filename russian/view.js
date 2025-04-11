const shimmer = document.getElementById('shimmer');
const details = document.getElementById('wordDetails');
const wordEn = document.getElementById('word-en');
const wordRu = document.getElementById('word-ru');
const wordTr = document.getElementById('word-tr');
const relatedWords = document.getElementById('relatedWords');
const bookmarkBtn = document.getElementById('bookmarkBtn');
const bookmarkIcon = document.getElementById('bookmarkIcon');
const toast = document.getElementById('toast');

let currentWord = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 1500);
}

async function isBookmarked(id) {
  const db = await openDB();
  const tx = db.transaction('bookmarks', 'readonly');
  const store = tx.objectStore('bookmarks');
  return new Promise(resolve => {
    const req = store.get(id);
    req.onsuccess = () => resolve(!!req.result);
  });
}

async function toggleBookmark() {
  const exists = await isBookmarked(currentWord.id);
  const db = await openDB();
  const tx = db.transaction('bookmarks', 'readwrite');
  const store = tx.objectStore('bookmarks');
  
  if (exists) {
    store.delete(currentWord.id);
    bookmarkIcon.setAttribute('fill', 'none');
    showToast('Removed!');
  } else {
    store.put(currentWord);
    bookmarkIcon.setAttribute('fill', 'currentColor');
    showToast('Bookmarked!');
  }
  
  return tx.complete;
}

bookmarkBtn.addEventListener('click', toggleBookmark);

async function renderWord(word) {
  shimmer.classList.remove('hidden');
  details.classList.add('hidden');
  
  if (!word) {
    const paramId = parseInt(new URLSearchParams(location.search).get('id'));
    word = await getWordById(paramId);
  }
  
  if (!word) return;
  
  currentWord = word;
  
  wordEn.textContent = word.en;
  wordRu.textContent = word.ru;
  wordTr.textContent = word.tr;
  
  const bookmarked = await isBookmarked(word.id);
  bookmarkIcon.setAttribute('fill', bookmarked ? 'currentColor' : 'none');
  
  const all = await getAllWords();
  const similar = all.filter(w => w.id !== word.id && (w.en.startsWith(word.en[0]) || w.ru.startsWith(word.ru[0])));
  relatedWords.innerHTML = similar.slice(0, 5).map(w => `
    <a href="?id=${w.id}" class="block bg-white rounded-xl p-4 shadow transition hover:bg-gray-50" onclick="event.preventDefault(); loadWord(${w.id})">
      ${w.en} — <span class="RobotoCondensed-Regular">${w.ru}</span>
    </a>
  `).join('');
  
  setTimeout(() => {
    shimmer.classList.add('hidden');
    details.classList.remove('hidden');
  }, 500);
}

async function loadWord(newId) {
  history.replaceState({}, '', `?id=${newId}`);
  const newWord = await getWordById(newId);
  if (!newWord) return;
  await renderWord(newWord);
}

renderWord();