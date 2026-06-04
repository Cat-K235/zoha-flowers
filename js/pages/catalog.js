/* ============================================
   ZOHA FLOWERS — Catalog Page
   ============================================ */

Router.register('catalog', (params) => {
  const activeCategory = params.category || 'all';
  const products = getProductsByCategory(activeCategory);

  const catTabs = CATEGORIES.map(cat => `
    <button class="filter-chip ${cat.id === activeCategory ? 'active' : ''}"
      onclick="Router.navigate('catalog',{category:'${cat.id}'})">
      ${cat.emoji} ${I18n.t(cat.nameKey, cat.name)}
    </button>`).join('');

  const cards = products.map(p => renderProductCard(p)).join('');

  return `
    <div class="page page-top-pad">
      <div class="filter-row">${catTabs}</div>
      <div class="filter-row" style="margin-top:-4px">
        <button class="filter-chip" onclick="sortCatalog('price_asc')">↑ ${I18n.getLang() === 'uz' ? 'Arzon' : I18n.getLang() === 'ru' ? 'Дешевле' : 'Cheapest'}</button>
        <button class="filter-chip" onclick="sortCatalog('price_desc')">↓ ${I18n.getLang() === 'uz' ? 'Qimmat' : I18n.getLang() === 'ru' ? 'Дороже' : 'Expensive'}</button>
        <button class="filter-chip" onclick="sortCatalog('rating')">★ ${I18n.getLang() === 'uz' ? 'Reyting' : I18n.getLang() === 'ru' ? 'Рейтинг' : 'Rating'}</button>
        <button class="filter-chip" onclick="sortCatalog('new')">🆕 ${I18n.getLang() === 'uz' ? 'Yangi' : I18n.getLang() === 'ru' ? 'Новые' : 'New'}</button>
      </div>
      <div class="products-grid" id="catalog-grid">
        ${cards || `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-text-light)">${I18n.t('search.empty')}</div>`}
      </div>
      <div class="spacer-16"></div>
    </div>`;
});

function sortCatalog(by) {
  const { params } = Router.getCurrent();
  const cat = params.category || 'all';
  let products = getProductsByCategory(cat);

  if (by === 'price_asc')  products.sort((a,b) => a.price - b.price);
  if (by === 'price_desc') products.sort((a,b) => b.price - a.price);
  if (by === 'rating')     products.sort((a,b) => b.rating - a.rating);
  if (by === 'new')        products = products.filter(p => p.newArrival).concat(products.filter(p => !p.newArrival));

  const grid = document.getElementById('catalog-grid');
  if (grid) {
    grid.innerHTML = products.map(p => renderProductCard(p)).join('');
  }

  document.querySelectorAll('.filter-chip').forEach(c => {
    if (c.dataset.sort) c.classList.remove('active');
  });

  TG.haptic.light();
}
