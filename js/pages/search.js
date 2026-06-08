/* ============================================
   ZOHA FLOWERS — Search Page
   ============================================ */

Router.register('search', () => {
  const lang = I18n.getLang();

  return `
    <div class="page">
      <!-- Search bar -->
      <div class="search-bar-wrap">
        <div class="search-input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="search-input" id="search-input" type="text"
            placeholder="${I18n.t('search.placeholder')}"
            autofocus
            oninput="performSearch(this.value)" />
          <button class="search-clear" onclick="clearSearch()" id="search-clear-btn" style="display:none">✕</button>
        </div>
      </div>

      <!-- Filter chips -->
      <div class="filter-row" id="search-filters">
        ${CATEGORIES.map(cat => `
          <button class="filter-chip ${cat.id === 'all' ? 'active' : ''}"
            data-cat="${cat.id}"
            onclick="filterSearch('${cat.id}', this)">
            ${cat.emoji} ${I18n.t(cat.nameKey, cat.name)}
          </button>`).join('')}
      </div>

      <!-- Price range -->
      <div class="filter-row">
        <button class="filter-chip" data-price="0-200000" onclick="filterByPrice(0, 200000, this)">
          ${lang === 'uz' ? 'Dan 200 ming' : lang === 'ru' ? 'До 200 000' : 'Under 200K'}
        </button>
        <button class="filter-chip" data-price="200000-400000" onclick="filterByPrice(200000, 400000, this)">
          200K - 400K
        </button>
        <button class="filter-chip" data-price="400000-999999" onclick="filterByPrice(400000, 999999, this)">
          ${lang === 'uz' ? '400 mingdan yuqori' : lang === 'ru' ? 'Более 400 000' : 'Above 400K'}
        </button>
      </div>

      <!-- Results -->
      <div id="search-results" class="products-grid" style="padding:0 16px">
        ${PRODUCTS.map(p => renderProductCard(p)).join('')}
      </div>
      <div class="spacer-16"></div>
    </div>`;
});

let searchActiveCategory = 'all';
let searchMinPrice = 0;
let searchMaxPrice = Infinity;

function performSearch(query) {
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

  let results = query ? searchProducts(query) : [...PRODUCTS];

  if (searchActiveCategory !== 'all') {
    results = results.filter(p => p.category === searchActiveCategory);
  }
  results = results.filter(p => p.price >= searchMinPrice && p.price <= searchMaxPrice);

  updateSearchResults(results, query);
}

function filterSearch(catId, btn) {
  searchActiveCategory = catId;
  document.querySelectorAll('#search-filters .filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const query = document.getElementById('search-input')?.value || '';
  performSearch(query);
  TG.haptic.light();
}

function filterByPrice(min, max, btn) {
  const isActive = btn.classList.contains('active');
  document.querySelectorAll('[data-price]').forEach(b => b.classList.remove('active'));
  if (isActive) {
    searchMinPrice = 0;
    searchMaxPrice = Infinity;
  } else {
    btn.classList.add('active');
    searchMinPrice = min;
    searchMaxPrice = max;
  }
  const query = document.getElementById('search-input')?.value || '';
  performSearch(query);
  TG.haptic.light();
}

function clearSearch() {
  const input = document.getElementById('search-input');
  if (input) { input.value = ''; input.focus(); }
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.style.display = 'none';
  updateSearchResults(PRODUCTS, '');
}

function updateSearchResults(results, query) {
  const container = document.getElementById('search-results');
  if (!container) return;

  if (!results.length) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px">
        <div style="font-size:48px;margin-bottom:12px">🔍</div>
        <div style="font-size:16px;color:var(--color-text-mid)">${I18n.t('search.empty')}</div>
        ${query ? `<div style="font-size:13px;color:var(--color-text-light);margin-top:6px">"${query}"</div>` : ''}
      </div>`;
    return;
  }

  container.innerHTML = results.map(p => renderProductCard(p)).join('');
}
