/* ============================================
   ZOHA FLOWERS — Checkout Page
   ============================================ */

Router.register('checkout', () => {
  const lang = I18n.getLang();
  const user = TG.getUser();
  const today = new Date().toISOString().split('T')[0];

  const timeSlots = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00'];

  return `
    <div class="page page-top-pad">
      <!-- Delivery section -->
      <div class="form-section">
        <div class="form-section-title" data-i18n="checkout.delivery">${I18n.t('checkout.delivery')}</div>
        <div class="form-group">
          <label class="form-label" data-i18n="checkout.date">${I18n.t('checkout.date')}</label>
          <input class="form-input" type="date" id="delivery-date" value="${today}" min="${today}" />
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="checkout.time">${I18n.t('checkout.time')}</label>
          <div class="time-slots" id="time-slots">
            ${timeSlots.map((t, i) => `
              <button class="time-slot ${i === 0 ? 'active' : ''}" onclick="selectTimeSlot(this, '${t}')">${t}</button>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="checkout.address">${I18n.t('checkout.address')}</label>
          <input class="form-input" type="text" id="delivery-address" placeholder="${lang === 'uz' ? 'Ko\'cha, uy raqami' : lang === 'ru' ? 'Улица, номер дома' : 'Street, house number'}" />
        </div>
      </div>

      <!-- Recipient section -->
      <div class="form-section">
        <div class="form-section-title" data-i18n="checkout.recipient">${I18n.t('checkout.recipient')}</div>
        <div class="form-group">
          <label class="form-label" data-i18n="checkout.name">${I18n.t('checkout.name')}</label>
          <input class="form-input" type="text" id="recipient-name"
            value="${user ? (user.first_name || '') + ' ' + (user.last_name || '') : ''}"
            placeholder="${lang === 'uz' ? 'Ism va familiya' : lang === 'ru' ? 'Имя и фамилия' : 'Full name'}" />
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="checkout.phone">${I18n.t('checkout.phone')}</label>
          <input class="form-input" type="tel" id="recipient-phone"
            placeholder="+998 90 000 00 00" />
        </div>
      </div>

      <!-- Greeting card -->
      <div class="form-section">
        <div class="form-section-title" data-i18n="checkout.card">${I18n.t('checkout.card')}</div>
        <div class="form-group">
          <textarea class="form-textarea" id="greeting-card"
            placeholder="${lang === 'uz' ? 'Tabriq so\'zlaringizni kiriting...' : lang === 'ru' ? 'Введите текст открытки...' : 'Enter your greeting message...'}"
            rows="3"></textarea>
        </div>
      </div>

      <!-- Notes -->
      <div class="form-section">
        <div class="form-section-title" data-i18n="checkout.notes">${I18n.t('checkout.notes')}</div>
        <div class="form-group">
          <textarea class="form-textarea" id="order-notes"
            placeholder="${lang === 'uz' ? 'Qo\'shimcha izoh...' : lang === 'ru' ? 'Дополнительные пожелания...' : 'Additional notes...'}"
            rows="2"></textarea>
        </div>
      </div>

      <!-- Payment method -->
      <div class="form-section">
        <div class="form-section-title" data-i18n="checkout.payment">${I18n.t('checkout.payment')}</div>
        <div style="display:flex;gap:10px">
          <button class="time-slot active" id="pay-cash" onclick="selectPayment('cash', this)" style="flex:1" data-i18n="checkout.cash">${I18n.t('checkout.cash')}</button>
          <button class="time-slot" id="pay-card" onclick="selectPayment('card', this)" style="flex:1" data-i18n="checkout.card_pay">${I18n.t('checkout.card_pay')}</button>
        </div>
      </div>

      <!-- Order summary -->
      <div class="cart-summary" style="margin:0 16px 12px">
        ${Cart.getItems().map(item => `
          <div class="summary-row">
            <span class="summary-label">${item.product.name[lang] || item.product.name.uz} ×${item.qty}</span>
            <span>${I18n.formatPrice(item.product.price * item.qty)}</span>
          </div>`).join('')}
        <div class="summary-row">
          <span class="summary-label" data-i18n="cart.delivery">${I18n.t('cart.delivery')}</span>
          <span>${Cart.getDelivery() === 0 ? I18n.t('free') : I18n.formatPrice(Cart.getDelivery())}</span>
        </div>
        ${Cart.getDiscount() > 0 ? `
        <div class="summary-row">
          <span class="summary-label summary-discount">${I18n.t('cart.discount')}</span>
          <span class="summary-discount">−${I18n.formatPrice(Cart.getDiscount())}</span>
        </div>` : ''}
        <div class="summary-row total">
          <span data-i18n="cart.total">${I18n.t('cart.total')}</span>
          <span class="amount">${I18n.formatPrice(Cart.getTotal())}</span>
        </div>
      </div>

      <div class="checkout-btn-wrap">
        <button class="btn-checkout ripple" onclick="submitOrder()">
          ✓ <span data-i18n="checkout.confirm">${I18n.t('checkout.confirm')}</span>
        </button>
      </div>
      <div class="spacer-16"></div>
    </div>`;
});

let selectedTime = '09:00-11:00';
let selectedPayment = 'cash';

function selectTimeSlot(btn, time) {
  selectedTime = time;
  document.querySelectorAll('#time-slots .time-slot').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  TG.haptic.light();
}

function selectPayment(method, btn) {
  selectedPayment = method;
  document.querySelectorAll('#pay-cash, #pay-card').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  TG.haptic.light();
}

function submitOrder() {
  if (Cart.getCount() === 0) {
    Toast.show(I18n.getLang() === 'uz' ? 'Savat bo\'sh' : I18n.getLang() === 'ru' ? 'Корзина пуста' : 'Cart is empty', 'error');
    TG.haptic.error();
    return;
  }

  const address = document.getElementById('delivery-address')?.value.trim();
  const name    = document.getElementById('recipient-name')?.value.trim();
  const phone   = document.getElementById('recipient-phone')?.value.trim();

  if (!address) {
    Toast.show(I18n.getLang() === 'uz' ? 'Manzilni kiriting' : I18n.getLang() === 'ru' ? 'Введите адрес' : 'Enter delivery address', 'error');
    TG.haptic.error();
    return;
  }
  if (!name) {
    Toast.show(I18n.getLang() === 'uz' ? 'Ism kiriting' : I18n.getLang() === 'ru' ? 'Введите имя' : 'Enter recipient name', 'error');
    TG.haptic.error();
    return;
  }
  if (!phone) {
    Toast.show(I18n.getLang() === 'uz' ? 'Telefon raqamini kiriting' : I18n.getLang() === 'ru' ? 'Введите телефон' : 'Enter phone number', 'error');
    TG.haptic.error();
    return;
  }

  const orderId = 'ZF-' + Date.now().toString().slice(-6);
  const date = document.getElementById('delivery-date')?.value;
  const greeting = document.getElementById('greeting-card')?.value;
  const notes = document.getElementById('order-notes')?.value;

  const orderData = {
    orderId,
    chatId: TG.getUser()?.id || null,
    items: Cart.getItems().map(i => ({
      name: i.product.name.uz,
      qty: i.qty,
      price: i.product.price,
    })),
    total: Cart.getTotal(),
    address,
    recipientName: name,
    phone,
    date,
    time: selectedTime,
    payment: selectedPayment,
    greeting,
    notes,
    lang: I18n.getLang(),
  };

  // Save to order history
  const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]');
  orders.unshift({ ...orderData, status: 0, statusHistory: [{ status: 0, time: new Date().toLocaleTimeString() }] });
  localStorage.setItem('zf_orders', JSON.stringify(orders));

  // Send to Telegram bot
  TG.sendOrderToBot(orderData);

  Cart.markOrdered();
  Cart.clear();

  TG.haptic.success();
  Router.navigate('order-success', { orderId }, false);
}
