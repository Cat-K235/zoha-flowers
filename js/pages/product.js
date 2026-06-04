/* ============================================
   ZOHA FLOWERS — Product Detail Page
   ============================================ */

Router.register('product', (params) => {
  const product = getProductById(params.id);
  if (!product) return '<div class="page page-top-pad text-center" style="padding:40px">Product not found</div>';

  const lang = I18n.getLang();
  const name = product.name[lang] || product.name.uz;
  const desc = product.desc[lang] || product.desc.uz;
  const isFav = Cart.isFav(product.id);

  const galleryDots = product.images.map((_, i) =>
    `<div class="gallery-dot ${i === 0 ? 'active' : ''}" onclick="setGalleryImg(${i})"></div>`
  ).join('');

  const similar = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const similarCards = similar.length
    ? `<section class="section">
        <div class="section-header">
          <h2 class="section-title" data-i18n="product.similar">${I18n.t('product.similar')}</h2>
        </div>
        <div class="products-scroll">${similar.map(p => renderProductCard(p)).join('')}</div>
      </section>`
    : '';

  const oldPriceHTML = product.oldPrice
    ? `<div style="font-size:14px;color:var(--color-text-light);text-decoration:line-through;font-family:var(--font-serif)">${I18n.formatPrice(product.oldPrice)}</div>`
    : '';

  const starsHTML = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));

  return `
    <div class="page" data-product-id="${product.id}">
      <!-- Gallery -->
      <div class="product-gallery" id="product-gallery">
        <div class="gallery-main" id="gallery-main">
          <span id="gallery-emoji" style="font-size:100px">${product.images[0]}</span>
        </div>
        <div class="gallery-dots">${galleryDots}</div>
        <button class="btn-fav ${isFav ? 'active' : ''}" id="detail-fav-btn"
          style="position:absolute;top:12px;right:12px;width:38px;height:38px;font-size:18px;background:rgba(255,255,255,0.9);border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center"
          onclick="toggleFavorite(${product.id},this)">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>

      <div class="product-detail-body">
        <!-- Name & Price -->
        <div class="product-detail-header">
          <h1 class="product-detail-name">${name}</h1>
          <div style="text-align:right">
            <div class="product-detail-price">${I18n.formatPrice(product.price)}</div>
            ${oldPriceHTML}
          </div>
        </div>

        <!-- Rating -->
        <div class="product-rating">
          <span class="stars">${starsHTML}</span>
          <span style="font-size:15px;font-weight:600">${product.rating}</span>
          <span class="rating-count">(${product.reviews} ${lang === 'uz' ? 'sharh' : lang === 'ru' ? 'отзывов' : 'reviews'})</span>
        </div>

        <!-- Description -->
        <p class="product-desc">${desc}</p>

        <!-- Composition -->
        <div class="composition-box">
          <div class="composition-title" data-i18n="product.composition">${I18n.t('product.composition')}</div>
          <div class="composition-items">
            ${product.composition.map(c => `<span class="composition-tag">🌿 ${c}</span>`).join('')}
          </div>
        </div>

        <!-- Quantity -->
        <div class="quantity-selector">
          <span class="qty-label" data-i18n="product.qty">${I18n.t('product.qty')}:</span>
          <div class="qty-controls">
            <button class="btn-qty" onclick="changeQty(-1)">−</button>
            <span class="qty-value" id="detail-qty">1</span>
            <button class="btn-qty" onclick="changeQty(1)">+</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-actions">
          <button class="btn-secondary ripple" onclick="addDetailToCart()">
            🛒 <span data-i18n="product.add">${I18n.t('product.add')}</span>
          </button>
          <button class="btn-primary ripple" onclick="buyNow()">
            ⚡ <span data-i18n="product.buy">${I18n.t('product.buy')}</span>
          </button>
        </div>

        <!-- Reviews -->
        ${product.reviews > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">⭐ ${lang === 'uz' ? 'Sharhlar' : lang === 'ru' ? 'Отзывы' : 'Reviews'}</h2>
          </div>
          <div class="reviews-list">
            ${REVIEWS.slice(0, 2).map(r => `
              <div class="review-card">
                <div class="review-header">
                  <div class="reviewer-avatar">${r.avatar}</div>
                  <div>
                    <div class="reviewer-name">${r.name}</div>
                    <div class="review-stars">${'★'.repeat(r.rating)}</div>
                  </div>
                  <span style="margin-left:auto;font-size:11px;color:var(--color-text-light)">${r.date}</span>
                </div>
                <div class="review-text">${r.text[lang] || r.text.uz}</div>
              </div>`).join('')}
          </div>
        </section>` : ''}
      </div>

      ${similarCards}
      <div class="spacer-16"></div>
    </div>`;
});

window.afterRender_product = (params) => {
  const product = getProductById(params.id);
  if (product) {
    document.getElementById('header-title').textContent = product.name[I18n.getLang()] || product.name.uz;
  }
};

function setGalleryImg(idx) {
  const product = getProductById(Router.getCurrent().params.id);
  if (!product) return;
  document.getElementById('gallery-emoji').textContent = product.images[idx];
  document.querySelectorAll('.gallery-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  TG.haptic.light();
}

function changeQty(delta) {
  const el = document.getElementById('detail-qty');
  if (!el) return;
  const current = parseInt(el.textContent);
  const next = Math.max(1, Math.min(20, current + delta));
  el.textContent = next;
  TG.haptic.light();
}

function addDetailToCart() {
  const { params } = Router.getCurrent();
  const qty = parseInt(document.getElementById('detail-qty')?.textContent || 1);
  Cart.add(Number(params.id), qty);
  const product = getProductById(params.id);
  Toast.show(`🌸 ${product?.name[I18n.getLang()] || ''} — ${I18n.t('product.add')}`, 'success');
  TG.haptic.success();
}

function buyNow() {
  const { params } = Router.getCurrent();
  const qty = parseInt(document.getElementById('detail-qty')?.textContent || 1);
  Cart.add(Number(params.id), qty);
  Router.navigate('checkout');
  TG.haptic.medium();
}
