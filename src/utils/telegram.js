import { ADMIN_USER_IDS } from '../data/products'

const tg = window.Telegram?.WebApp

export function initTelegram() {
  if (!tg) return
  tg.ready()
  tg.expand()
  if (tg.colorScheme === 'dark') {
    document.body.classList.add('tg-dark')
  }
  try {
    tg.setHeaderColor('#d4726f')
    tg.setBackgroundColor('#fdf8f3')
  } catch (_) {}
}

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user || null
}

export function checkIsAdmin(userId) {
  return ADMIN_USER_IDS.includes(userId)
}

export function onInitDataChanged(handler) {
  if (!tg || !tg.onEvent) return
  tg.onEvent('initDataChanged', handler)
  return () => tg?.offEvent?.('initDataChanged', handler)
}

export const haptic = {
  light:   () => tg?.HapticFeedback?.impactOccurred('light'),
  medium:  () => tg?.HapticFeedback?.impactOccurred('medium'),
  heavy:   () => tg?.HapticFeedback?.impactOccurred('heavy'),
  success: () => tg?.HapticFeedback?.notificationOccurred('success'),
  error:   () => tg?.HapticFeedback?.notificationOccurred('error'),
  warning: () => tg?.HapticFeedback?.notificationOccurred('warning'),
  select:  () => tg?.HapticFeedback?.selectionChanged(),
}

export function sendOrderToBot(orderData) {
  if (!tg) return
  const data = JSON.stringify({ type: 'order', ...orderData })
  tg.sendData(data)
}

export function sendDeliveryUpdateToBot(updateData) {
  if (!tg) return
  const data = JSON.stringify({ type: 'delivery_update', ...updateData })
  tg.sendData(data)
}

export function sendWebAppData(payload) {
  if (!tg) return
  tg.sendData(JSON.stringify(payload))
}

export function openLink(url) {
  if (tg) { tg.openLink(url) } else { window.open(url, '_blank') }
}

export function openTelegramLink(url) {
  if (tg) { tg.openTelegramLink(url) } else { window.open(url, '_blank') }
}
