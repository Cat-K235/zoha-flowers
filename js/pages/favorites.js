/* ============================================
   ZOHA FLOWERS — Favorites / Wishlist Page
   ============================================ */

Router.register('favorites', () => {
  const lang = I18n.getLang();
  const favProducts = Cart.getFavorites();

  if (!favProducts.length) {
    return `
      <div class="page">
        <div class="cart-empty">
          <div class="cart-empty-icon animate-bounce-in">🤍</div>
          <h2 class="cart-empty-title" data-i18n="favorites.empty">${I18n.t('favorites.empty')}</h2>
          <p class="cart-empty-text">${lang === 'uz' ? 'Sevimli mahsulotlaringizni bu yerda saqlang' : lang === 'ru' ? 'Сохраняйте понравившиеся товары здесь' : 'Save your favorite products here'}</p>
          <div class="spacer-16"></div>
          <button class="btn-primary" style="padding:0 28px" onclick="Router.navigate('catalog')">
            🌸 ${lang === 'uz' ? 'Katalogni ko\'rish' : lang === 'ru' ? 'Открыть каталог' : 'Browse Catalog'}
          </button>
        </div>
      </div>`;
  }

  return `
    <div class="page page-top-pad">
      <div class="products-grid" style="padding:0 16px">
        ${favProducts.map(p => renderProductCard(p)).join('')}
      </div>
      <div class="spacer-16"></div>
    </div>`;
});
