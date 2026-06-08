/* ============================================
   ZOHA FLOWERS — Cart Management
   ============================================ */

const Cart = (() => {
  const STORAGE_KEY = 'zf_cart';
  const FAV_KEY     = 'zf_favorites';
  const PROMO_CODES = { 'ZOHA10': 10, 'WELCOME': 15, 'SPRING24': 20 };

  let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  let favorites = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
  let appliedPromo = null;
  let firstOrderDiscount = !localStorage.getItem('zf_ordered');

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  const saveFavs = () => localStorage.setItem(FAV_KEY, JSON.stringify(favorites));

  const add = (productId, qty = 1) => {
    const existing = items.find(i => i.id === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id: productId, qty });
    }
    save();
    updateBadge();
    return true;
  };

  const remove = (productId) => {
    items = items.filter(i => i.id !== productId);
    save();
    updateBadge();
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) { remove(productId); return; }
    const item = items.find(i => i.id === productId);
    if (item) { item.qty = qty; save(); }
  };

  const clear = () => { items = []; save(); updateBadge(); };

  const getItems = () => items.map(i => ({
    ...i,
    product: getProductById(i.id)
  })).filter(i => i.product);

  const getCount = () => items.reduce((sum, i) => sum + i.qty, 0);

  const getSubtotal = () => {
    return getItems().reduce((sum, i) => sum + i.product.price * i.qty, 0);
  };

  const getDelivery = () => {
    const sub = getSubtotal();
    return sub >= 500000 ? 0 : 30000;
  };

  const getDiscount = () => {
    const firstDiscount = firstOrderDiscount ? getSubtotal() * 0.10 : 0;
    const promoDiscount = appliedPromo ? getSubtotal() * (PROMO_CODES[appliedPromo] / 100) : 0;
    return Math.round(Math.max(firstDiscount, promoDiscount));
  };

  const getTotal = () => getSubtotal() + getDelivery() - getDiscount();

  const applyPromo = (code) => {
    const upper = code.trim().toUpperCase();
    if (PROMO_CODES[upper]) {
      appliedPromo = upper;
      return { ok: true, percent: PROMO_CODES[upper] };
    }
    return { ok: false };
  };

  const updateBadge = () => {
    const badge = document.getElementById('cart-badge');
    const count = getCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  };

  const toggleFav = (productId) => {
    const idx = favorites.indexOf(productId);
    if (idx === -1) { favorites.push(productId); }
    else            { favorites.splice(idx, 1); }
    saveFavs();
    return favorites.includes(productId);
  };

  const isFav = (productId) => favorites.includes(productId);
  const getFavorites = () => favorites.map(id => getProductById(id)).filter(Boolean);

  const markOrdered = () => {
    localStorage.setItem('zf_ordered', '1');
    firstOrderDiscount = false;
  };

  const isFirstOrder = () => firstOrderDiscount;

  updateBadge();

  return { add, remove, updateQty, clear, getItems, getCount, getSubtotal, getDelivery, getDiscount, getTotal, applyPromo, toggleFav, isFav, getFavorites, markOrdered, isFirstOrder, updateBadge };
})();
