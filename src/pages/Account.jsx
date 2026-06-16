import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { useCart } from '../contexts/CartContext'
import { useTelegram } from '../contexts/TelegramContext'
import Modal from '../components/Modal'

const Chevron = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const LANGS = [
  { code: 'uz', flag: '🇺🇿', name: "O'zbekcha", native: 'Uzbek' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский',   native: 'Russian' },
  { code: 'en', flag: '🇬🇧', name: 'English',   native: 'English' },
]

export default function Account() {
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()
  const { isFirstOrder, getFavoriteProducts } = useCart()
  const { user, isAdmin } = useTelegram()
  const [langModal, setLangModal] = useState(false)

  const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]')
  const favCount = getFavoriteProducts().length
  const discount = isFirstOrder ? '10%' : '0%'

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
    : (lang === 'uz' ? 'Mehmon' : lang === 'ru' ? 'Гость' : 'Guest')

  const usernameLabel = user
    ? (user.username ? `@${user.username}` : `ID: ${user.id}`)
    : 'Telegram'

  const ordersLabel  = lang === 'uz' ? `${orders.length} ta buyurtma` : lang === 'ru' ? `${orders.length} заказов` : `${orders.length} orders`
  const favLabel     = lang === 'uz' ? `${favCount} ta mahsulot`      : lang === 'ru' ? `${favCount} товаров`      : `${favCount} items`
  const currentLangName = LANGS.find(l => l.code === lang)?.name || "O'zbekcha"

  const menuItems = [
    { icon: '📦', label: t('account.orders'),    sub: ordersLabel,       path: '/orders' },
    { icon: '🏠', label: t('account.addresses'), sub: lang === 'uz' ? 'Saqlangan manzillar' : lang === 'ru' ? 'Сохранённые адреса' : 'Saved addresses', path: '/addresses' },
    { icon: '❤️', label: t('account.favorites'), sub: favLabel,          path: '/favorites' },
    { icon: '🌐', label: lang === 'uz' ? 'Til sozlamalari' : lang === 'ru' ? 'Настройки языка' : 'Language Settings', sub: currentLangName, action: () => setLangModal(true) },
    { icon: '📞', label: t('account.contacts'),  sub: '+998 94 487 00 97', path: '/contacts' },
    ...(isAdmin ? [{ icon: '⚙️', label: t('account.admin'), sub: lang === 'uz' ? 'Admin panel' : lang === 'ru' ? 'Панель управления' : 'Admin panel', path: '/admin' }] : []),
  ]

  const handleItem = (item) => {
    if (item.action) item.action()
    else navigate(item.path)
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="account-header">
        <div className="account-avatar">
          {user?.photo_url
            ? <img src={user.photo_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '👤'}
        </div>
        <div>
          <div className="account-name">{displayName}</div>
          <div className="account-id">{usernameLabel}</div>
          {isFirstOrder && (
            <div className="first-order-badge">🎁 {t('account.firstOrder')}</div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row" style={{ marginTop: 12 }}>
        <div className="stat-box">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">{lang === 'uz' ? 'Buyurtma' : lang === 'ru' ? 'Заказов' : 'Orders'}</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{favCount}</div>
          <div className="stat-label">{lang === 'uz' ? 'Sevimli' : lang === 'ru' ? 'Избранных' : 'Favorites'}</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{discount}</div>
          <div className="stat-label">{lang === 'uz' ? 'Chegirma' : lang === 'ru' ? 'Скидка' : 'Discount'}</div>
        </div>
      </div>

      {/* Menu */}
      <div className="menu-list">
        {menuItems.map((item, i) => (
          <button key={i} className="menu-item" onClick={() => handleItem(item)}>
            <div className="menu-item-icon">{item.icon}</div>
            <div className="menu-item-text">
              <div className="menu-item-label">{item.label}</div>
              <div className="menu-item-sub">{item.sub}</div>
            </div>
            <span className="menu-chevron"><Chevron /></span>
          </button>
        ))}
      </div>

      <div className="spacer-16" />

      {/* Language Modal */}
      <Modal isOpen={langModal} onClose={() => setLangModal(false)}>
        <div className="modal-handle" />
        <div className="modal-title">{t('lang.select')}</div>
        <div className="lang-options">
          {LANGS.map(l => (
            <div
              key={l.code}
              className={`lang-option${l.code === lang ? ' active' : ''}`}
              onClick={() => { setLang(l.code); setLangModal(false) }}
            >
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-name">{l.name}</span>
              <span className="lang-native">{l.native}</span>
              {l.code === lang && <span style={{ color: 'var(--color-rose-dark)' }}>✓</span>}
            </div>
          ))}
        </div>
        <div className="spacer-16" />
      </Modal>
    </div>
  )
}
