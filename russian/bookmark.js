document.addEventListener('DOMContentLoaded', () => loadBookmarks(true));

async function loadBookmarks(showShimmer = true) {
  const container = document.getElementById('bookmark-list');
  const shimmer = document.getElementById('shimmer');
  
  if (showShimmer) {
    shimmer.classList.remove('hidden');
  }
  container.innerHTML = '';
  
  const bookmarks = await getBookmarks();
  
  const render = () => {
    shimmer.classList.add('hidden');
    
    if (bookmarks.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-500 mt-10">No bookmarks yet.</p>`;
      return;
    }
    
    bookmarks.forEach(word => {
      const card = document.createElement('div');
      card.className = 'bg-green-50 p-4 rounded-lg border border-[#e8e8e8] transition cursor-pointer relative mb-4';
      card.onclick = () => {
        history.replaceState(null, '', `view.html?id=${word.id}`);
        window.location.href = `view.html?id=${word.id}`;
      };
      
      card.innerHTML = `
        <div>
          <h2 class="text-xl font-semibold text-blue-600">${word.en}</h2>
          <p class="text-lg text-gray-700 RobotoCondensed-Regular">${word.ru}</p>
          <p class="text-sm text-gray-400">${word.pron || ''}</p>
          <button onclick="event.stopPropagation(); removeBookmark(${word.id})"
            class="absolute top-3 right-3 text-red-500 hover:text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  };
  
  if (showShimmer) {
    setTimeout(render, 500);
  } else {
    render();
  }
}

async function getBookmarks() {
  const db = await openDB();
  const tx = db.transaction('bookmarks', 'readonly');
  const store = tx.objectStore('bookmarks');
  const bookmarks = [];
  
  return new Promise((resolve) => {
    const request = store.openCursor(null, 'prev'); // Newest first
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        bookmarks.push(cursor.value);
        cursor.continue();
      } else {
        resolve(bookmarks);
      }
    };
  });
}

async function removeBookmark(id) {
  const db = await openDB();
  const tx = db.transaction('bookmarks', 'readwrite');
  tx.objectStore('bookmarks').delete(Number(id));
  await tx.complete;
  
  loadBookmarks(false);
}