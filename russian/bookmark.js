document.addEventListener('DOMContentLoaded', loadBookmarks);

async function loadBookmarks() {
  const container = document.getElementById('bookmark-list');
  const shimmer = document.getElementById('shimmer');
  
  shimmer.classList.remove('hidden');
  container.innerHTML = '';
  
  const bookmarks = await getBookmarks();
  
  setTimeout(() => {
    shimmer.classList.add('hidden');
    
    if (bookmarks.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-500 mt-10">No bookmarks yet.</p>`;
      return;
    }
    
    bookmarks.forEach(word => {
      const card = document.createElement('div');
      card.className = 'bg-[#fdfdfd] border border-[#e8e8e8] rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer relative mb-4';
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
  }, 500);
}

async function removeBookmark(id) {
  const container = document.getElementById('bookmark-list');
  
  const db = await openDB();
  const tx = db.transaction('bookmarks', 'readwrite');
  tx.objectStore('bookmarks').delete(Number(id));
  await tx.complete;
  
  // Reload the list without shimmer
  loadBookmarks();
}