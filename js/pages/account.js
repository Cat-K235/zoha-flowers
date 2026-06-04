/* ============================================
   ZOHA FLOWERS — Account Page
   ============================================ */

Router.register('account', () => {
  const lang = I18n.getLang();
  const user = TG.getUser();
  const isAdmin = TG.isAdmin();
  const firstName = user?.first_name || (lang === 'uz' ? 'Mehmon' : lang === 'ru' ? 'Гость' : 'Guest');
  const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]');
  const favCount = Cart.getFavorites().length;

  const menuItems = [
    { icon: '📦', label: I18n.t('account.orders'), sub: `${orders.length} ${lang === 'uz' ? 'ta buyurtma' : lang === 'ru' ? 'заказов' : 'orders'}`, page: 'orders' },
    { icon: '🏠', label: I18n.t('account.addresses'), sub: lang === 'uz' ? 'Saqlangan manzillar' : lang === 'ru' ? 'Сохранённые адреса' : 'Saved addresses', page: 'addresses' },
    { icon: '❤️', label: I18n.t('account.favorites'), sub: `${favCount} ${lang === 'uz' ? 'ta mahsulot' : lang === 'ru' ? 'товаров' : 'items'}`, page: 'favorites' },
    { icon: '🌐', label: lang === 'uz' ? 'Til sozlamalari' : lang === 'ru' ? 'Настройки языка' : 'Language Settings', sub: lang === 'uz' ? 'O\'zbek' : lang === 'ru' ? 'Русский' : 'English', page: 'lang' },
    { icon: '📞', label: I18n.t('account.contacts'), sub: '+998 94 487 00 97', page: 'contacts' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: '⚙️', label: I18n.t('account.admin'), sub: lang === 'uz' ? 'Admin panel' : lang === 'ru' ? 'Панель управления' : 'Admin panel', page: 'admin' });
  }

  return `
    <div class="page">
      <!-- Account Header -->
      <div class="account-header">
        <div class="account-avatar">
          ${user?.photo_url ? `<img src="${user.photo_url}" alt="avatar" />` : '👤'}
        </div>
        <div>
          <div class="account-name">${firstName} ${user?.last_name || ''}</div>
          <div class="account-id">${user ? `@${user.username || 'user'}` : 'Telegram'}</div>
          ${Cart.isFirstOrder() ? `
          <div class="first-order-badge">🎁 ${I18n.t('account.firstOrder')}</div>` : ''}
        </div>
      </div>

      <!-- Stats row -->
      <div class="stats-row" style="margin-top:12px">
        <div class="stat-box">
          <div class="stat-value">${orders.length}</div>
          <div class="stat-label">${lang === 'uz' ? 'Buyurtma' : lang === 'ru' ? 'Заказов' : 'Orders'}</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${favCount}</div>
          <div class="stat-label">${lang === 'uz' ? 'Sevimli' : lang === 'ru' ? 'Избранных' : 'Favorites'}</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${Cart.isFirstOrder() ? '10%' : '0%'}</div>
          <div class="stat-label">${lang === 'uz' ? 'Chegirma' : lang === 'ru' ? 'Скидка' : 'Discount'}</div>
        </div>
      </div>

      <!-- Menu -->
      <div class="menu-list">
        ${menuItems.map(item => `
          <button class="menu-item ripple" onclick="handleAccountMenu('${item.page}')">
            <div class="menu-item-icon">${item.icon}</div>
            <div class="menu-item-text">
              <div class="menu-item-label">${item.label}</div>
              <div class="menu-item-sub">${item.sub}</div>
            </div>
            <svg class="menu-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>`).join('')}
      </div>
      <div class="spacer-16"></div>
    </div>`;
});

function handleAccountMenu(page) {
  if (page === 'lang') {
    showLanguageModal();
  } else {
    Router.navigate(page);
  }
  TG.haptic.light();
}

function showLanguageModal() {
  const langs = [
    { code: 'uz', flag: '🇺🇿', name: 'O\'zbekcha', native: 'Uzbek' },
    { code: 'ru', flag: '🇷🇺', name: 'Русский',   native: 'Russian' },
    { code: 'en', flag: '🇬🇧', name: 'English',   native: 'English' },
  ];
  const current = I18n.getLang();

  Modal.show(`
    <div class="modal-handle"></div>
    <div class="modal-title" data-i18n="lang.select">${I18n.t('lang.select')}</div>
    <div class="lang-options">
      ${langs.map(l => `
        <div class="lang-option ${l.code === current ? 'active' : ''}" onclick="changeLang('${l.code}')">
          <span class="lang-flag">${l.flag}</span>
          <span class="lang-name">${l.name}</span>
          <span class="lang-native">${l.native}</span>
          ${l.code === current ? '<span style="color:var(--color-rose-dark)">✓</span>' : ''}
        </div>`).join('')}
    </div>
    <div class="spacer-16"></div>
  `);
}

function changeLang(code) {
  I18n.setLang(code);
  Modal.hide();
  Router.navigate('account', {}, false);
  TG.haptic.success();
}

Router.register('addresses', () => {
  const lang = I18n.getLang();
  const addresses = JSON.parse(localStorage.getItem('zf_addresses') || '[]');
  return `
    <div class="page page-top-pad">
      <div style="padding:0 16px">
        ${addresses.length ? addresses.map(a => `
          <div class="form-section" style="margin-bottom:10px">
            <div style="font-size:14px;font-weight:500">${a.label}</div>
            <div style="font-size:13px;color:var(--color-text-mid);margin-top:4px">${a.address}</div>
          </div>`).join('') : `
          <div class="cart-empty">
            <div class="cart-empty-icon">🏠</div>
            <h2 class="cart-empty-title">${lang === 'uz' ? 'Manzillar yo\'q' : lang === 'ru' ? 'Нет адресов' : 'No saved addresses'}</h2>
          </div>`}
      </div>
    </div>`;
});
