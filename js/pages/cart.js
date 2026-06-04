/* ============================================
   ZOHA FLOWERS — Cart Page
   ============================================ */

Router.register('cart', () => {
  const items = Cart.getItems();
  const lang = I18n.getLang();

  if (!items.length) {
    return `
      <div class="page">
        <div class="cart-empty">
          <div class="cart-empty-icon animate-bounce-in">🛒</div>
          <h2 class="cart-empty-title" data-i18n="cart.empty">${I18n.t('cart.empty')}</h2>
          <p class="cart-empty-text" data-i18n="cart.empty.sub">${I18n.t('cart.empty.sub')}</p>
          <div class="spacer-16"></div>
          <button class="btn-primary" style="padding:0 32px" onclick="Router.navigate('catalog')">
            🌸 ${lang === 'uz' ? 'Katalogga o\'tish' : lang === 'ru' ? 'Перейти в каталог' : 'Go to Catalog'}
          </button>
        </div>
      </div>`;
  }

  const itemsHTML = items.map(item => {
    const name = item.product.name[lang] || item.product.name.uz;
    return `
      <div class="cart-item" id="cart-item-${item.id}">
        <div class="cart-item-img" onclick="Router.navigate('product',{id:${item.id}})">
          <span>${item.product.emoji}</span>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${name}</div>
          <div class="cart-item-price">${I18n.formatPrice(item.product.price * item.qty)}</div>
          <div class="cart-item-controls">
            <div class="cart-qty">
              <button class="cart-qty-btn" onclick="cartUpdateQty(${item.id}, ${item.qty - 1})">−</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button class="cart-qty-btn" onclick="cartUpdateQty(${item.id}, ${item.qty + 1})">+</button>
            </div>
            <button class="cart-item-remove" onclick="cartRemoveItem(${item.id})">🗑</button>
          </div>
        </div>
      </div>`;
  }).join('');

  const delivery = Cart.getDelivery();
  const discount = Cart.getDiscount();
  const total = Cart.getTotal();

  return `
    <div class="page page-top-pad">
      <div class="cart-list">${itemsHTML}</div>

      <!-- Promo code -->
      <div class="promo-input-row">
        <input class="promo-input" id="promo-input" placeholder="${I18n.t('cart.promo')}" type="text" />
        <button class="promo-apply ripple" onclick="applyPromoCode()" data-i18n="cart.apply">${I18n.t('cart.apply')}</button>
      </div>

      <!-- Summary -->
      <div class="cart-summary">
        <div class="summary-row">
          <span class="summary-label" data-i18n="cart.subtotal">${I18n.t('cart.subtotal')}</span>
          <span>${I18n.formatPrice(Cart.getSubtotal())}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label" data-i18n="cart.delivery">${I18n.t('cart.delivery')}</span>
          <span>${delivery === 0 ? I18n.t('free') : I18n.formatPrice(delivery)}</span>
        </div>
        ${discount > 0 ? `
        <div class="summary-row">
          <span class="summary-label summary-discount" data-i18n="cart.discount">${I18n.t('cart.discount')}</span>
          <span class="summary-discount">−${I18n.formatPrice(discount)}</span>
        </div>` : ''}
        <div class="summary-row total">
          <span data-i18n="cart.total">${I18n.t('cart.total')}</span>
          <span class="amount">${I18n.formatPrice(total)}</span>
        </div>
      </div>

      <div class="checkout-btn-wrap">
        <button class="btn-checkout ripple" onclick="Router.navigate('checkout')">
          🌸 <span data-i18n="cart.checkout">${I18n.t('cart.checkout')}</span>
        </button>
      </div>
      <div class="spacer-16"></div>
    </div>`;
});

function cartUpdateQty(productId, qty) {
  Cart.updateQty(productId, qty);
  Router.navigate('cart', {}, false);
  TG.haptic.light();
}

function cartRemoveItem(productId) {
  Cart.remove(productId);
  const el = document.getElementById(`cart-item-${productId}`);
  if (el) {
    el.style.transition = 'opacity 0.3s, transform 0.3s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => Router.navigate('cart', {}, false), 300);
  }
  TG.haptic.medium();
}

function applyPromoCode() {
  const input = document.getElementById('promo-input');
  if (!input) return;
  const result = Cart.applyPromo(input.value);
  if (result.ok) {
    Toast.show(`✓ -${result.percent}% ${I18n.getLang() === 'uz' ? 'chegirma qo\'llanildi' : I18n.getLang() === 'ru' ? 'скидка применена' : 'discount applied'}`, 'success');
    Router.navigate('cart', {}, false);
    TG.haptic.success();
  } else {
    Toast.show(I18n.getLang() === 'uz' ? 'Noto\'g\'ri kod' : I18n.getLang() === 'ru' ? 'Неверный код' : 'Invalid code', 'error');
    TG.haptic.error();
  }
}
