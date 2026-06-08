/* ============================================
   ZOHA FLOWERS — Admin Panel
   ============================================ */

Router.register('admin', () => {
  if (!TG.isAdmin()) {
    return '<div class="page page-top-pad text-center" style="padding:40px"><p>Access denied</p></div>';
  }

  const lang = I18n.getLang();
  const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]');
  const todayOrders = orders.filter(o => o.date === new Date().toISOString().split('T')[0]);
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const monthRevenue = orders
    .filter(o => o.date?.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, o) => s + (o.total || 0), 0);

  const adminCards = [
    { emoji: '📦', label: I18n.t('admin.products'),   count: PRODUCTS.length, action: 'admin-products' },
    { emoji: '🏷️', label: I18n.t('admin.categories'), count: CATEGORIES.length, action: 'admin-categories' },
    { emoji: '📋', label: I18n.t('admin.orders'),     count: orders.length, action: 'admin-orders' },
    { emoji: '⭐', label: I18n.t('admin.reviews'),    count: REVIEWS.length, action: 'admin-reviews' },
    { emoji: '📊', label: I18n.t('admin.analytics'),  count: null, action: 'admin-analytics' },
    { emoji: '🎟️', label: I18n.t('admin.promo'),      count: 3, action: 'admin-promo' },
  ];

  return `
    <div class="page page-top-pad">
      <!-- Stats -->
      <div class="stats-row" style="margin:0 16px 16px">
        <div class="stat-box">
          <div class="stat-value">${todayOrders.length}</div>
          <div class="stat-label" data-i18n="admin.stats.today">${I18n.t('admin.stats.today')}</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${monthRevenue > 0 ? (monthRevenue / 1000000).toFixed(1) + 'M' : '0'}</div>
          <div class="stat-label" data-i18n="admin.stats.month">${I18n.t('admin.stats.month')}</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${totalRevenue > 0 ? (totalRevenue / 1000000).toFixed(1) + 'M' : '0'}</div>
          <div class="stat-label" data-i18n="admin.stats.total">${I18n.t('admin.stats.total')}</div>
        </div>
      </div>

      <!-- Admin cards -->
      <div class="admin-grid">
        ${adminCards.map(card => `
          <div class="admin-card ripple" onclick="handleAdminAction('${card.action}')">
            <div class="admin-card-icon">${card.emoji}</div>
            <div class="admin-card-label">${card.label}</div>
            ${card.count !== null ? `<div class="admin-card-count">${card.count} ${lang === 'uz' ? 'ta' : lang === 'ru' ? 'шт.' : 'items'}</div>` : ''}
          </div>`).join('')}
      </div>

      <!-- Recent orders -->
      <div style="padding:16px">
        <div class="section-header" style="padding:0;margin-bottom:12px">
          <h2 class="section-title">${lang === 'uz' ? 'So\'nggi buyurtmalar' : lang === 'ru' ? 'Последние заказы' : 'Recent Orders'}</h2>
        </div>
        ${orders.length ? orders.slice(0, 5).map(order => renderAdminOrderRow(order, lang)).join('') : `
          <div style="text-align:center;padding:20px;color:var(--color-text-light)">
            ${lang === 'uz' ? 'Buyurtmalar yo\'q' : lang === 'ru' ? 'Нет заказов' : 'No orders'}
          </div>`}
      </div>
      <div class="spacer-16"></div>
    </div>`;
});

function renderAdminOrderRow(order, lang) {
  const statusLabels = [
    lang === 'uz' ? 'Yangi' : lang === 'ru' ? 'Новый' : 'New',
    lang === 'uz' ? 'Tayyorlanmoqda' : lang === 'ru' ? 'Готовится' : 'Preparing',
    lang === 'uz' ? 'Kuryer yo\'lda' : lang === 'ru' ? 'В пути' : 'In Transit',
    lang === 'uz' ? 'Yetkazildi' : lang === 'ru' ? 'Доставлен' : 'Delivered',
  ];
  const statusColors = ['#e0b870', 'var(--color-gold)', 'var(--color-rose-dark)', 'var(--color-success)'];
  const status = order.status || 0;

  return `
    <div class="form-section" style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:600;font-size:14px">#${order.orderId}</div>
          <div style="font-size:12px;color:var(--color-text-light)">${escapeHtml(order.recipientName)} • ${escapeHtml(order.phone)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:var(--font-serif);font-size:15px;color:var(--color-rose-dark)">${I18n.formatPrice(order.total)}</div>
          <select class="form-select" style="height:30px;font-size:12px;padding:0 8px;margin-top:4px;color:${statusColors[status]};font-weight:600"
            onchange="updateOrderStatus('${order.orderId}', this.value)">
            ${statusLabels.map((l, i) => `<option value="${i}" ${i === status ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>`;
}

function updateOrderStatus(orderId, newStatus) {
  const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]');
  const order = orders.find(o => o.orderId === orderId);
  if (order) {
    order.status = parseInt(newStatus);
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({ status: parseInt(newStatus), time: new Date().toLocaleTimeString() });
    localStorage.setItem('zf_orders', JSON.stringify(orders));
    Toast.show('✓ ' + (I18n.getLang() === 'uz' ? 'Status yangilandi' : I18n.getLang() === 'ru' ? 'Статус обновлён' : 'Status updated'), 'success');
    TG.haptic.success();
  }
}

function handleAdminAction(action) {
  const lang = I18n.getLang();
  switch (action) {
    case 'admin-orders':
      Router.navigate('orders');
      break;
    case 'admin-products':
      showAdminProducts();
      break;
    case 'admin-analytics':
      showAdminAnalytics();
      break;
    case 'admin-promo':
      showAdminPromo();
      break;
    default:
      Toast.show(lang === 'uz' ? 'Tez orada...' : lang === 'ru' ? 'Скоро...' : 'Coming soon...', '');
  }
  TG.haptic.light();
}

function showAdminProducts() {
  const lang = I18n.getLang();
  const rows = PRODUCTS.map(p => `
    <div class="menu-item" style="margin-bottom:6px">
      <div class="menu-item-icon" style="font-size:22px">${p.emoji}</div>
      <div class="menu-item-text">
        <div class="menu-item-label">${p.name[lang] || p.name.uz}</div>
        <div class="menu-item-sub">${I18n.formatPrice(p.price)} • ${p.category}</div>
      </div>
      <div style="font-size:12px;color:${p.badge === 'sale' ? 'var(--color-rose-dark)' : p.badge === 'new' ? 'var(--color-gold)' : 'var(--color-text-light)'}">
        ${p.badge ? p.badge.toUpperCase() : '—'}
      </div>
    </div>`).join('');

  Modal.show(`
    <div class="modal-handle"></div>
    <div class="modal-title">${I18n.t('admin.products')}</div>
    <div style="padding:0 16px;max-height:60vh;overflow-y:auto">${rows}</div>
    <div class="spacer-16"></div>
  `);
}

function showAdminAnalytics() {
  const lang = I18n.getLang();
  const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]');
  const categoryStats = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const p = getProductById(item.productId);
      if (p) {
        categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
      }
    });
  });

  Modal.show(`
    <div class="modal-handle"></div>
    <div class="modal-title">${I18n.t('admin.analytics')}</div>
    <div style="padding:0 20px">
      <div class="stats-row" style="margin-bottom:16px">
        <div class="stat-box">
          <div class="stat-value">${orders.length}</div>
          <div class="stat-label">${lang === 'uz' ? 'Jami' : lang === 'ru' ? 'Всего' : 'Total'}</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${orders.filter(o => o.status === 3).length}</div>
          <div class="stat-label">${lang === 'uz' ? 'Yetkazildi' : lang === 'ru' ? 'Доставлено' : 'Delivered'}</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${I18n.formatPrice(orders.reduce((s, o) => s + (o.total || 0), 0)).split(' ')[0]}</div>
          <div class="stat-label">${lang === 'uz' ? 'Daromad' : lang === 'ru' ? 'Выручка' : 'Revenue'}</div>
        </div>
      </div>
      <div style="font-size:13px;color:var(--color-text-mid);text-align:center;padding:12px 0">
        ${lang === 'uz' ? 'Kengaytirilgan statistika tez orada...' : lang === 'ru' ? 'Расширенная аналитика скоро...' : 'Advanced analytics coming soon...'}
      </div>
    </div>
    <div class="spacer-16"></div>
  `);
}

function showAdminPromo() {
  const promoCodes = [
    { code: 'ZOHA10',   percent: 10, uses: 23 },
    { code: 'WELCOME',  percent: 15, uses: 8  },
    { code: 'SPRING24', percent: 20, uses: 5  },
  ];
  const lang = I18n.getLang();

  Modal.show(`
    <div class="modal-handle"></div>
    <div class="modal-title">${I18n.t('admin.promo')}</div>
    <div style="padding:0 16px">
      ${promoCodes.map(p => `
        <div class="form-section" style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-size:16px;font-weight:700;letter-spacing:1px;color:var(--color-rose-dark)">${p.code}</div>
            <div style="font-size:14px;font-weight:600">−${p.percent}%</div>
          </div>
          <div style="font-size:12px;color:var(--color-text-light);margin-top:4px">
            ${lang === 'uz' ? `${p.uses} marta ishlatilgan` : lang === 'ru' ? `Использован ${p.uses} раз` : `Used ${p.uses} times`}
          </div>
        </div>`).join('')}
    </div>
    <div class="spacer-16"></div>
  `);
}
