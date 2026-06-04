/* ============================================
   ZOHA FLOWERS — Main Application Entry
   ============================================ */

(function initApp() {
  // Initialize Telegram SDK
  TG.init();

  // Init nav click handlers
  Router.initClickHandlers();

  // Bind header action buttons
  document.getElementById('btn-cart')?.addEventListener('click', () => {
    Router.navigate('cart');
    TG.haptic.light();
  });

  document.getElementById('btn-search')?.addEventListener('click', () => {
    Router.navigate('search');
    TG.haptic.light();
  });

  document.getElementById('btn-lang')?.addEventListener('click', () => {
    showLanguageModal();
    TG.haptic.light();
  });

  // Apply translations
  I18n.applyTranslations();

  // Update language label
  document.getElementById('lang-label').textContent = I18n.getLang().toUpperCase();

  // Animate splash → home
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    splash?.classList.add('hidden');
    // Navigate to home
    Router.navigate('home', {}, false);
  }, 1600);

  // Update cart badge on load
  Cart.updateBadge();

  // Handle Telegram back button
  window.addEventListener('popstate', () => Router.back());

  // Keyboard dismiss
  document.addEventListener('click', (e) => {
    if (!e.target.closest('input, textarea, select')) {
      document.activeElement?.blur();
    }
  });

  // Prevent bounce on iOS
  document.addEventListener('touchmove', (e) => {
    if (e.target === document.body) e.preventDefault();
  }, { passive: false });

  // Handle Telegram theme changes
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.onEvent('themeChanged', () => {
      const isDark = window.Telegram.WebApp.colorScheme === 'dark';
      document.body.classList.toggle('tg-dark', isDark);
    });
  }
})();
