document.addEventListener('DOMContentLoaded', async () => {
  const shimmer = document.getElementById('searchShimmer');
  const shimmerCards = document.getElementById('homeShimmer');
  const homeCards = document.getElementById('homeCards');
  const searchBar = document.getElementById('searchBar');
  const resultArea = document.getElementById('searchResults');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const clearInputBtn = document.getElementById('clearInput');
  
  // Initial UI loading
  shimmer.classList.remove('hidden');
  shimmerCards.classList.remove('hidden');
  searchBar.classList.add('hidden');
  homeCards.classList.add('hidden');
  resultArea.classList.add('hidden');
  clearSearchBtn.classList.add('hidden');
  
  await loadJSONOnce();
  const allWords = await getAllWords();
  
  // Random Word
  const randomWord = document.getElementById('randomWord');
  if (allWords.length > 0) {
    const random = allWords[Math.floor(Math.random() * allWords.length)];
    randomWord.textContent = `${random.en} — ${random.ru}`;
    randomWord.addEventListener('click', () => {
      window.location.href = `view.html?id=${random.id}`;
    });
  } else {
    randomWord.textContent = 'No words found';
  }
  
  // Bookmarks
  const bookmarks = await getBookmarks();
  const bookmarkList = document.getElementById('bookmarkList');
  if (bookmarks.length > 0) {
    bookmarkList.innerHTML = bookmarks.slice(0, 5).map(w =>
      `<li class="text-blue-600 hover:underline cursor-pointer" data-id="${w.id}">${w.en} — ${w.ru}</li>`
    ).join('');
  } else {
    bookmarkList.innerHTML = '<li>No bookmarks</li>';
  }
  
  // Recent
  const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  const recentList = document.getElementById('recentList');
  if (recent.length > 0) {
    recentList.innerHTML = recent.slice(0, 5).map(term =>
      `<li class="text-blue-600 hover:underline cursor-pointer" data-term="${term}">${term}</li>`
    ).join('');
  } else {
    recentList.innerHTML = '<li>No recent searches</li>';
  }
  
  const clearRecentBtn = document.getElementById('clearRecentBtn');
  if (clearRecentBtn) {
  clearRecentBtn.addEventListener('click', () => {
    localStorage.removeItem('recentSearches');
    const recentList = document.getElementById('recentList');
    recentList.innerHTML = '<li class="text-gray-400">No recent searches</li>';
  });
}
  
  // Show UI
  setTimeout(() => {
    shimmer.classList.add('hidden');
    shimmerCards.classList.add('hidden');
    searchBar.classList.remove('hidden');
    homeCards.classList.remove('hidden');
  }, 500);
  
  // Search logic
async function handleSearch(query = searchInput.value.trim().toLowerCase()) {
  if (!query) return;

  let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  recentSearches = [query, ...recentSearches.filter(q => q !== query)].slice(0, 10);
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  refreshRecentList();
  
  function refreshRecentList() {
  const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  const recentList = document.getElementById('recentList');
  if (recentSearches.length > 0) {
    recentList.innerHTML = recentSearches.slice(0, 5).map(term =>
      `<li class="text-blue-600 hover:underline cursor-pointer" data-term="${term}">${term}</li>`
    ).join('');
  } else {
    recentList.innerHTML = '<li class="text-gray-400">No recent searches</li>';
  }
}

  const results = await searchWords(query);
  homeCards.classList.add('hidden');
  resultArea.classList.remove('hidden');
  clearSearchBtn.classList.remove('hidden');

  if (results.length === 0) {
    resultArea.innerHTML = `<p class="text-center text-gray-500 mt-4">No results found</p>`;
  } else {
    renderSearchResults(results);
  }
}
  
  function renderSearchResults(words) {
    resultArea.innerHTML = '';
    words.forEach(word => {
      const card = document.createElement('div');
      card.className = 'bg-white p-4 rounded-xl shadow mb-3 border cursor-pointer hover:bg-gray-50 transition border-[#e8e8e8]';
      card.innerHTML = `
        <h2 class="text-lg font-semibold text-blue-700 Inter-Bold">${word.en}</h2>
        <p class="text-gray-600 RobotoCondensed-Regular">${word.ru}</p>
      `;
      card.addEventListener('click', () => {
        window.location.href = `view.html?id=${word.id}`;
      });
      resultArea.appendChild(card);
    });
  }
  
  // Event Listeners
  searchBtn.addEventListener('click', () => handleSearch());
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  clearSearchBtn.addEventListener('click', () => {
    resultArea.classList.add('hidden');
    clearSearchBtn.classList.add('hidden');
    homeCards.classList.remove('hidden');
    searchInput.value = '';
  });
  
  clearInputBtn.addEventListener('click', () => {
    searchInput.value = '';
    resultArea.classList.add('hidden');
    clearSearchBtn.classList.add('hidden');
    homeCards.classList.remove('hidden');
  });
  
  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() === '') {
      resultArea.classList.add('hidden');
      clearSearchBtn.classList.add('hidden');
      homeCards.classList.remove('hidden');
    }
  });
  
  // Delegate bookmarks & recent
  bookmarkList.addEventListener('click', (e) => {
    if (e.target.dataset.id) {
      window.location.href = `view.html?id=${e.target.dataset.id}`;
    }
  });
  
  recentList.addEventListener('click', (e) => {
    if (e.target.dataset.term) {
      searchInput.value = e.target.dataset.term;
      handleSearch(e.target.dataset.term);
    }
  });
});