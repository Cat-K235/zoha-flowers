/* ============================================
   ZOHA FLOWERS — Orders & Order Success Pages
   ============================================ */

Router.register('order-success', (params) => {
  const lang = I18n.getLang();
  return `
    <div class="page">
      <div class="order-success">
        <div class="success-icon">🌸</div>
        <h2 class="success-title" data-i18n="order.success">${I18n.t('order.success')}</h2>
        <p class="success-text" data-i18n="order.success.text">${I18n.t('order.success.text')}</p>
        <div class="order-number">
          ${I18n.t('order.number')}: <span>#${params.orderId}</span>
        </div>
        <button class="btn-primary" style="padding:0 28px;margin-bottom:12px" onclick="Router.navigate('orders')">
          📦 ${I18n.t('order.track')}
        </button>
        <button class="btn-secondary" style="padding:0 28px" onclick="Router.navigate('home')">
          🌸 ${lang === 'uz' ? 'Bosh sahifaga' : lang === 'ru' ? 'На главную' : 'Back to Home'}
        </button>
      </div>
    </div>`;
});

Router.register('orders', () => {
  const lang = I18n.getLang();
  const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]');

  const statusLabels = [
    I18n.t('order.status.accepted'),
    I18n.t('order.status.preparing'),
    I18n.t('order.status.courier'),
    I18n.t('order.status.delivered'),
  ];
  const statusEmojis = ['📋', '🌸', '🚴', '✅'];
  const statusColors = ['var(--color-text-light)', 'var(--color-gold)', 'var(--color-rose)', 'var(--color-success)'];

  if (!orders.length) {
    return `
      <div class="page">
        <div class="cart-empty">
          <div class="cart-empty-icon">📦</div>
          <h2 class="cart-empty-title">${lang === 'uz' ? 'Buyurtmalar yo\'q' : lang === 'ru' ? 'Нет заказов' : 'No orders yet'}</h2>
          <p class="cart-empty-text">${lang === 'uz' ? 'Birinchi buyurtmangizni bering!' : lang === 'ru' ? 'Сделайте первый заказ!' : 'Make your first order!'}</p>
          <div class="spacer-16"></div>
          <button class="btn-primary" style="padding:0 28px" onclick="Router.navigate('catalog')">
            🌸 ${lang === 'uz' ? 'Buyurtma qilish' : lang === 'ru' ? 'Сделать заказ' : 'Order Now'}
          </button>
        </div>
      </div>`;
  }

  const orderCards = orders.map(order => `
    <div class="form-section" style="cursor:pointer" onclick="showOrderTracking('${order.orderId}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <div>
          <div style="font-weight:600;font-size:15px">#${order.orderId}</div>
          <div style="font-size:12px;color:var(--color-text-light)">${escapeHtml(order.date)} • ${escapeHtml(order.time)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:var(--font-serif);font-size:16px;color:var(--color-rose-dark)">${I18n.formatPrice(order.total)}</div>
          <div style="font-size:12px;color:${statusColors[order.status || 0]};font-weight:600">
            ${statusEmojis[order.status || 0]} ${statusLabels[order.status || 0]}
          </div>
        </div>
      </div>
      <div style="font-size:13px;color:var(--color-text-mid)">${escapeHtml(order.address)}</div>
      <div style="margin-top:12px">
        ${renderTrackingMini(order.status || 0)}
      </div>
    </div>`).join('');

  return `
    <div class="page page-top-pad">
      <div style="padding:0 16px">
        ${orderCards}
      </div>
      <div class="spacer-16"></div>
    </div>`;
});

function renderTrackingMini(currentStatus) {
  const statuses = [
    { key: 'order.status.accepted',  emoji: '📋' },
    { key: 'order.status.preparing', emoji: '🌸' },
    { key: 'order.status.courier',   emoji: '🚴' },
    { key: 'order.status.delivered', emoji: '✅' },
  ];
  return `
    <div style="display:flex;align-items:center;gap:0">
      ${statuses.map((s, i) => `
        <div style="display:flex;align-items:center;flex:1">
          <div style="width:24px;height:24px;border-radius:50%;
            background:${i <= currentStatus ? 'var(--color-success)' : 'var(--color-beige)'};
            display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0">
            ${i <= currentStatus ? '✓' : s.emoji}
          </div>
          ${i < 3 ? `<div style="flex:1;height:2px;background:${i < currentStatus ? 'var(--color-success)' : 'var(--color-beige-mid)'}"></div>` : ''}
        </div>`).join('')}
    </div>`;
}

function showOrderTracking(orderId) {
  const lang = I18n.getLang();
  const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]');
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const statuses = [
    { key: 'order.status.accepted',  emoji: '📋' },
    { key: 'order.status.preparing', emoji: '🌸' },
    { key: 'order.status.courier',   emoji: '🚴' },
    { key: 'order.status.delivered', emoji: '✅' },
  ];

  const stepsHTML = statuses.map((s, i) => {
    const isDone   = i < order.status;
    const isActive = i === order.status;
    const historyItem = order.statusHistory?.find(h => h.status === i);
    return `
      <div class="tracking-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}">
        <div class="step-icon">${isDone ? '✓' : s.emoji}</div>
        <div class="step-content">
          <div class="step-label">${I18n.t(s.key)}</div>
          ${historyItem ? `<div class="step-time">${historyItem.time}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  Modal.show(`
    <div class="modal-handle"></div>
    <div class="modal-title">📦 #${order.orderId}</div>
    <div class="tracking-steps">${stepsHTML}</div>
    <div style="padding:0 20px 8px">
      <div style="background:var(--color-beige);border-radius:var(--radius-md);padding:12px 14px">
        <div style="font-size:12px;color:var(--color-text-light);margin-bottom:4px">${I18n.t('checkout.address')}</div>
        <div style="font-size:14px">${escapeHtml(order.address)}</div>
      </div>
    </div>
  `);
}
