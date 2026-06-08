/* ============================================
   ZOHA FLOWERS — Custom Bouquet Builder
   ============================================ */

let builderSelection = {};

Router.register('builder', () => {
  const lang = I18n.getLang();
  builderSelection = {};

  return `
    <div class="page page-top-pad">
      <div style="padding:0 16px 12px">
        <h1 class="section-title" style="font-size:24px;margin-bottom:4px" data-i18n="builder.title">${I18n.t('builder.title')}</h1>
        <p style="font-size:13px;color:var(--color-text-mid)">
          ${lang === 'uz' ? 'O\'z orzu bouquetingizni yarating' : lang === 'ru' ? 'Создайте свой идеальный букет' : 'Create your dream bouquet'}
        </p>
      </div>

      <!-- Canvas -->
      <div class="builder-canvas" id="builder-canvas">
        <div id="builder-preview" style="font-size:72px;letter-spacing:-8px;text-align:center;min-height:80px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:2px">
          <span style="font-size:24px;color:rgba(0,0,0,0.3)" data-i18n="builder.canvas">${I18n.t('builder.canvas')}</span>
        </div>
      </div>

      <!-- Summary bar -->
      <div id="builder-summary" style="display:none;margin:8px 16px;background:white;border-radius:var(--radius-lg);padding:12px 16px;box-shadow:var(--shadow-sm);align-items:center;justify-content:space-between">
        <div>
          <span id="builder-count-text" style="font-size:14px;font-weight:600;color:var(--color-text)">0</span>
          <span style="font-size:13px;color:var(--color-text-mid)"> ${I18n.t('builder.count')}</span>
        </div>
        <div style="font-family:var(--font-serif);font-size:18px;color:var(--color-rose-dark)" id="builder-total-text">0</div>
      </div>

      <!-- Flower palette -->
      <div style="padding:12px 16px 8px">
        <div class="composition-title" data-i18n="builder.flowers">${I18n.t('builder.flowers')}</div>
      </div>
      <div class="flower-palette">
        ${BUILDER_FLOWERS.map(flower => `
          <div class="flower-option" id="flower-${flower.id}" onclick="builderToggleFlower('${flower.id}')">
            <div class="flower-emoji">${flower.emoji}</div>
            <div class="flower-name">${flower.name[lang] || flower.name.uz}</div>
            <div class="flower-price">${I18n.formatPrice(flower.price)}</div>
            <div class="flower-qty" id="flower-qty-${flower.id}" style="display:none;font-size:12px;font-weight:700;color:var(--color-rose-dark)">×0</div>
          </div>`).join('')}
      </div>

      <!-- Controls -->
      <div style="padding:12px 16px;display:flex;gap:10px">
        <button class="btn-secondary" style="flex:1;height:46px" onclick="builderClear()">
          🗑 <span data-i18n="builder.clear">${I18n.t('builder.clear')}</span>
        </button>
        <button class="btn-primary" style="flex:2;height:46px" onclick="builderOrder()" id="builder-order-btn">
          🌸 <span data-i18n="builder.order">${I18n.t('builder.order')}</span>
        </button>
      </div>
      <div class="spacer-16"></div>
    </div>`;
});

function builderToggleFlower(flowerId) {
  const flower = BUILDER_FLOWERS.find(f => f.id === flowerId);
  if (!flower) return;

  if (!builderSelection[flowerId]) builderSelection[flowerId] = 0;
  builderSelection[flowerId]++;

  if (builderSelection[flowerId] > 10) {
    builderSelection[flowerId] = 0;
  }

  updateBuilderUI();
  TG.haptic.light();
}

function builderClear() {
  builderSelection = {};
  updateBuilderUI();
  TG.haptic.medium();
}

function updateBuilderUI() {
  const lang = I18n.getLang();
  let totalCount = 0;
  let totalPrice = 0;
  let previewEmojis = [];

  BUILDER_FLOWERS.forEach(flower => {
    const qty = builderSelection[flower.id] || 0;
    const option = document.getElementById(`flower-${flower.id}`);
    const qtyEl  = document.getElementById(`flower-qty-${flower.id}`);

    if (option) {
      option.classList.toggle('selected', qty > 0);
    }
    if (qtyEl) {
      qtyEl.style.display = qty > 0 ? 'block' : 'none';
      qtyEl.textContent = `×${qty}`;
    }

    totalCount += qty;
    totalPrice += qty * flower.price;
    for (let i = 0; i < qty; i++) previewEmojis.push(flower.emoji);
  });

  // Update canvas
  const preview = document.getElementById('builder-preview');
  if (preview) {
    if (previewEmojis.length === 0) {
      preview.innerHTML = `<span style="font-size:24px;color:rgba(0,0,0,0.3)">${I18n.t('builder.canvas')}</span>`;
    } else {
      preview.innerHTML = previewEmojis
        .map((e, i) => `<span class="builder-flower stagger-${Math.min(i + 1, 6)}" style="font-size:${Math.max(32, 60 - previewEmojis.length * 2)}px">${e}</span>`)
        .join('');
    }
  }

  // Update summary
  const summary = document.getElementById('builder-summary');
  const countText = document.getElementById('builder-count-text');
  const totalText = document.getElementById('builder-total-text');

  if (summary) summary.style.display = totalCount > 0 ? 'flex' : 'none';
  if (countText) countText.textContent = totalCount;
  if (totalText) totalText.textContent = I18n.formatPrice(totalPrice);
}

function builderOrder() {
  const totalCount = Object.values(builderSelection).reduce((s, q) => s + q, 0);
  if (totalCount === 0) {
    Toast.show(I18n.getLang() === 'uz' ? 'Hech bo\'lmasa bitta gul tanlang' : I18n.getLang() === 'ru' ? 'Выберите хотя бы один цветок' : 'Select at least one flower', 'warning');
    TG.haptic.warning();
    return;
  }

  const lang = I18n.getLang();
  let totalPrice = 0;
  const composition = [];

  BUILDER_FLOWERS.forEach(flower => {
    const qty = builderSelection[flower.id] || 0;
    if (qty > 0) {
      totalPrice += qty * flower.price;
      composition.push(`${flower.name[lang] || flower.name.uz} ×${qty}`);
    }
  });

  // Create a virtual product and add to cart
  const customProduct = {
    id: 9999,
    name: { uz: 'Mening Bouquetim', ru: 'Мой Букет', en: 'My Custom Bouquet' },
    desc: { uz: composition.join(', '), ru: composition.join(', '), en: composition.join(', ') },
    price: totalPrice,
    oldPrice: null,
    category: 'bouquets',
    emoji: '💐',
    badge: null,
    rating: 5,
    reviews: 0,
    composition,
    featured: false,
    bestseller: false,
    newArrival: false,
    seasonal: false,
    images: ['💐'],
  };

  // Temporarily add to PRODUCTS list
  const existingIdx = PRODUCTS.findIndex(p => p.id === 9999);
  if (existingIdx >= 0) PRODUCTS[existingIdx] = customProduct;
  else PRODUCTS.push(customProduct);

  Cart.add(9999, 1);
  Toast.show(`💐 ${I18n.getLang() === 'uz' ? 'Savatga qo\'shildi' : I18n.getLang() === 'ru' ? 'Добавлено в корзину' : 'Added to cart'}`, 'success');
  TG.haptic.success();
  Router.navigate('cart');
}
