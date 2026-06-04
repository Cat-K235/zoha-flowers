/* ============================================
   ZOHA FLOWERS — Home Page
   ============================================ */

const renderProductCard = (product, small = false) => {
  const lang = I18n.getLang();
  const name = product.name[lang] || product.name.uz;
  const isFav = Cart.isFav(product.id);
  const badgeHTML = product.badge
    ? `<span class="product-badge ${product.badge}">${product.badge === 'new' ? 'NEW' : 'SALE'}</span>`
    : '';
  const oldPriceHTML = product.oldPrice
    ? `<span class="old-price">${I18n.formatPrice(product.oldPrice)}</span>`
    : '';
  return `
    <div class="product-card" onclick="Router.navigate('product',{id:${product.id}})">
      <div class="product-img">
        <span>${product.emoji}</span>
        ${badgeHTML}
        <button class="btn-fav ${isFav ? 'active' : ''}" onclick="event.stopPropagation();toggleFavorite(${product.id},this)">${isFav ? '❤️' : '🤍'}</button>
      </div>
      <div class="product-info">
        <div class="product-name">${name}</div>
        <div class="product-sub">★ ${product.rating} (${product.reviews})</div>
        <div class="product-footer">
          <div class="product-price">${I18n.formatPrice(product.price)}${oldPriceHTML}</div>
          <button class="btn-add-quick" onclick="event.stopPropagation();quickAddToCart(${product.id})">+</button>
        </div>
      </div>
    </div>`;
};

const renderSection = (titleKey, products, seeAllPage = 'catalog') => {
  if (!products.length) return '';
  const cards = products.slice(0, 6).map(p => renderProductCard(p)).join('');
  return `
    <section class="section">
      <div class="section-header">
        <h2 class="section-title" data-i18n="${titleKey}">${I18n.t(titleKey)}</h2>
        <span class="section-link" onclick="Router.navigate('catalog')" data-i18n="section.seeAll">${I18n.t('section.seeAll')}</span>
      </div>
      <div class="products-scroll">${cards}</div>
    </section>`;
};

Router.register('home', () => {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const styles = `left:${10 + i * 12}%;animation-duration:${4 + i * 0.5}s;animation-delay:${i * 0.7}s`;
    return `<span class="hero-petal" style="${styles}">🌸</span>`;
  }).join('');

  return `
    <div class="page">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-bg"></div>
        <div class="hero-petals">${petals}</div>
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span data-i18n="hero.badge">${I18n.t('hero.badge')}</span>
          </div>
          <h1 class="hero-title" data-i18n="hero.title">${I18n.t('hero.title')}</h1>
          <p class="hero-sub" data-i18n="hero.sub">${I18n.t('hero.sub')}</p>
          <button class="hero-cta ripple" onclick="Router.navigate('catalog')">
            <span>🌸</span>
            <span data-i18n="hero.cta">${I18n.t('hero.cta')}</span>
          </button>
        </div>
      </div>

      <!-- First Order Promo -->
      ${Cart.isFirstOrder() ? `
      <div class="promo-strip animate-fade-in">
        <div class="promo-text">
          <div class="promo-label" data-i18n="promo.label">${I18n.t('promo.label')}</div>
          <div class="promo-value" data-i18n="promo.value">${I18n.t('promo.value')}</div>
        </div>
        <button class="promo-btn" onclick="Router.navigate('catalog')" data-i18n="promo.btn">${I18n.t('promo.btn')}</button>
      </div>` : ''}

      <!-- Categories -->
      <section class="section">
        <div class="categories-scroll">
          ${CATEGORIES.filter(c => c.id !== 'all').map(cat => `
            <div class="category-pill" onclick="Router.navigate('catalog',{category:'${cat.id}'})">
              <div class="pill-icon">${cat.emoji}</div>
              <span class="pill-label">${I18n.t(cat.nameKey, cat.name)}</span>
            </div>
          `).join('')}
        </div>
      </section>

      ${renderSection('section.featured', getFeatured())}
      ${renderSection('section.bestsellers', getBestSellers())}
      ${renderSection('section.new', getNewArrivals())}
      ${renderSection('section.seasonal', getSeasonal())}

      <!-- Reviews strip -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">⭐ ${I18n.getLang() === 'uz' ? 'Mijozlar sharhlari' : I18n.getLang() === 'ru' ? 'Отзывы клиентов' : 'Customer Reviews'}</h2>
        </div>
        <div class="reviews-list">
          ${REVIEWS.slice(0, 3).map(r => `
            <div class="review-card animate-fade-in">
              <div class="review-header">
                <div class="reviewer-avatar">${r.avatar}</div>
                <div>
                  <div class="reviewer-name">${r.name}</div>
                  <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                </div>
                <div class="reviewer-date" style="margin-left:auto;font-size:11px;color:var(--color-text-light)">${r.date}</div>
              </div>
              <div class="review-text">${r.text[I18n.getLang()] || r.text.uz}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Contact strip -->
      <section class="section">
        <div style="margin:0 16px;background:linear-gradient(135deg,var(--color-beige) 0%,var(--color-beige-mid) 100%);border-radius:var(--radius-xl);padding:20px 24px;text-align:center">
          <div style="font-size:28px;margin-bottom:8px">📞</div>
          <div style="font-family:var(--font-serif);font-size:18px;margin-bottom:4px">+998 94 487 00 97</div>
          <div style="font-size:12px;color:var(--color-text-mid);margin-bottom:16px">Telegram: @zohid7 • 24/7</div>
          <button class="btn-primary" style="width:100%;max-width:220px;margin:0 auto" onclick="Router.navigate('contacts')">
            ${I18n.getLang() === 'uz' ? 'Aloqa' : I18n.getLang() === 'ru' ? 'Связаться' : 'Contact Us'}
          </button>
        </div>
      </section>
      <div class="spacer-16"></div>
    </div>`;
});

function quickAddToCart(productId) {
  Cart.add(productId);
  const product = getProductById(productId);
  const lang = I18n.getLang();
  const name = product?.name[lang] || product?.name.uz || '';
  Toast.show(`🌸 ${name} — ${I18n.t('product.add')}`, 'success');
  TG.haptic.success();
}

function toggleFavorite(productId, btn) {
  const isFav = Cart.toggleFav(productId);
  btn.innerHTML = isFav ? '❤️' : '🤍';
  btn.classList.toggle('active', isFav);
  btn.style.animation = 'heartBeat 0.4s ease';
  setTimeout(() => btn.style.animation = '', 400);
  TG.haptic.light();
}
