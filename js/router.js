/* ============================================
   ZOHA FLOWERS — Client-Side Router
   ============================================ */

const Router = (() => {
  const PAGE_RENDERERS = {};
  let currentPage = 'home';
  let currentParams = {};
  const history = [];

  const register = (name, renderer) => {
    PAGE_RENDERERS[name] = renderer;
  };

  const navigate = (page, params = {}, pushToHistory = true) => {
    if (pushToHistory && currentPage !== page) {
      history.push({ page: currentPage, params: currentParams });
    }
    currentPage  = page;
    currentParams = params;

    const main = document.getElementById('app-main');
    if (!main) return;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Update header
    updateHeader(page, params);

    // Render
    if (PAGE_RENDERERS[page]) {
      const content = PAGE_RENDERERS[page](params);
      main.innerHTML = content;
      main.scrollTop = 0;

      // Trigger page-enter animation
      main.classList.remove('page-enter');
      void main.offsetWidth;
      main.classList.add('page-enter');

      // Re-run i18n
      I18n.applyTranslations();

      // Page-specific afterRender
      if (window[`afterRender_${page}`]) {
        window[`afterRender_${page}`](params);
      }
    } else {
      main.innerHTML = `<div class="page page-top-pad text-center" style="padding:40px"><p>Page "${page}" not found</p></div>`;
    }

    TG.haptic.select();
  };

  const back = () => {
    if (history.length > 0) {
      const prev = history.pop();
      navigate(prev.page, prev.params, false);
    } else {
      navigate('home', {}, false);
    }
  };

  const updateHeader = (page, params) => {
    const logo     = document.getElementById('header-logo');
    const title    = document.getElementById('header-title');
    const btnBack  = document.getElementById('btn-back');
    const btnSearch = document.getElementById('btn-search');

    const mainPages = ['home', 'catalog', 'builder', 'favorites', 'account'];
    const isMain = mainPages.includes(page);

    logo.style.display    = isMain ? 'flex' : 'none';
    title.style.display   = isMain ? 'none' : 'block';
    btnBack.style.display = isMain ? 'none' : 'flex';
    btnSearch.style.display = page === 'search' ? 'none' : 'flex';

    const TITLES = {
      product:   () => params.name || 'Product',
      cart:      () => I18n.t('cart.title'),
      checkout:  () => I18n.t('checkout.title'),
      account:   () => I18n.t('account.title'),
      orders:    () => I18n.t('account.orders'),
      contacts:  () => I18n.t('account.contacts'),
      admin:     () => I18n.t('admin.title'),
      search:    () => I18n.t('search.placeholder'),
      favorites: () => I18n.t('nav.favorites'),
      builder:   () => I18n.t('builder.title'),
      catalog:   () => I18n.t('nav.catalog'),
    };

    if (!isMain && TITLES[page]) {
      title.textContent = TITLES[page]();
    }

    btnBack.onclick = back;
  };

  const getCurrent = () => ({ page: currentPage, params: currentParams });

  // Bind nav items and global click handlers
  const initClickHandlers = () => {
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', (e) => {
        const page = el.dataset.page;
        if (page) navigate(page);
      });
    });
  };

  return { register, navigate, back, getCurrent, initClickHandlers };
})();

// HTML escape utility — use for any user-supplied content inserted via innerHTML
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Toast notification utility
const Toast = (() => {
  const show = (message, type = '', duration = 2500) => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', warning: '⚠' };
    toast.innerHTML = `${icons[type] ? `<span>${icons[type]}</span>` : ''}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };
  return { show };
})();

// Modal utility
const Modal = (() => {
  const show = (content) => {
    const overlay = document.getElementById('modal-overlay');
    const inner   = document.getElementById('modal-content');
    inner.innerHTML = content;
    overlay.style.display = 'flex';
    overlay.onclick = (e) => { if (e.target === overlay) hide(); };
    I18n.applyTranslations();
  };
  const hide = () => {
    document.getElementById('modal-overlay').style.display = 'none';
  };
  return { show, hide };
})();
