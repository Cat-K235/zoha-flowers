/* ============================================
   ZOHA FLOWERS — Telegram Mini App Integration
   ============================================ */

const TG = (() => {
  const tg = window.Telegram?.WebApp;

  const init = () => {
    if (!tg) return;
    tg.ready();
    tg.expand();

    // Apply Telegram theme colors if available
    if (tg.colorScheme === 'dark') {
      document.body.classList.add('tg-dark');
    }

    // Set header color
    tg.setHeaderColor('#fdf8f3');
    tg.setBackgroundColor('#fdf8f3');
  };

  const getUser = () => {
    if (!tg?.initDataUnsafe?.user) return null;
    return tg.initDataUnsafe.user;
  };

  const showMainButton = (text, callback) => {
    if (!tg) return;
    tg.MainButton.setText(text);
    tg.MainButton.onClick(callback);
    tg.MainButton.show();
    tg.MainButton.setParams({ color: '#d4726f', text_color: '#ffffff' });
  };

  const hideMainButton = () => {
    if (!tg) return;
    tg.MainButton.hide();
    tg.MainButton.offClick();
  };

  const showBackButton = (callback) => {
    if (!tg) return;
    tg.BackButton.show();
    tg.BackButton.onClick(callback);
  };

  const hideBackButton = () => {
    if (!tg) return;
    tg.BackButton.hide();
    tg.BackButton.offClick();
  };

  const haptic = {
    light:   () => tg?.HapticFeedback?.impactOccurred('light'),
    medium:  () => tg?.HapticFeedback?.impactOccurred('medium'),
    heavy:   () => tg?.HapticFeedback?.impactOccurred('heavy'),
    success: () => tg?.HapticFeedback?.notificationOccurred('success'),
    error:   () => tg?.HapticFeedback?.notificationOccurred('error'),
    warning: () => tg?.HapticFeedback?.notificationOccurred('warning'),
    select:  () => tg?.HapticFeedback?.selectionChanged(),
  };

  const sendOrderToBot = (orderData) => {
    if (!tg) return;
    const data = JSON.stringify({ type: 'order', ...orderData });
    tg.sendData(data);
  };

  const openLink = (url) => {
    if (tg) { tg.openLink(url); }
    else     { window.open(url, '_blank'); }
  };

  const openTelegramLink = (url) => {
    if (tg) { tg.openTelegramLink(url); }
    else     { window.open(url, '_blank'); }
  };

  const close = () => tg?.close();

  const isAdmin = () => {
    const user = getUser();
    if (!user) return false;
    const adminIds = [ADMIN_USER_ID];
    return adminIds.includes(user.id);
  };

  const getInitData = () => tg?.initData || '';

  return { init, getUser, showMainButton, hideMainButton, showBackButton, hideBackButton, haptic, sendOrderToBot, openLink, openTelegramLink, close, isAdmin, getInitData };
})();
