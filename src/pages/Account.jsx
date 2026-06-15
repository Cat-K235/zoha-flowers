import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { useCart } from '../contexts/CartContext'
import { useTelegram } from '../contexts/TelegramContext'

const Chevron = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

export default function Account() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { isFirstOrder } = useCart()
  const { user, isAdmin } = useTelegram()

  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User' : 'Guest'

  const menuItems = [
    { icon: '📦', label: t('account.orders'), sub: '', path: '/orders' },
    { icon: '❤️', label: t('account.favorites'), sub: '', path: '/favorites' },
    { icon: '📞', label: t('account.contacts'), sub: '', path: '/contacts' },
    ...(isAdmin ? [{ icon: '⚙️', label: t('account.admin'), sub: '', path: '/admin' }] : []),
  ]

  return (
    <div className="page">
      {/* Account header */}
      <div className="account-header">
        <div className="account-avatar">
          {user?.photo_url
            ? <img src={user.photo_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '👤'}
        </div>
        <div>
          <div className="account-name">{displayName}</div>
          {user && <div className="account-id">ID: {user.id}</div>}
          {isFirstOrder && (
            <div className="first-order-badge">🎁 {t('account.firstOrder')}</div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="menu-list">
        {menuItems.map((item, i) => (
          <button key={i} className="menu-item" onClick={() => navigate(item.path)}>
            <div className="menu-item-icon">{item.icon}</div>
            <div className="menu-item-text">
              <div className="menu-item-label">{item.label}</div>
              {item.sub && <div className="menu-item-sub">{item.sub}</div>}
            </div>
            <span className="menu-chevron"><Chevron /></span>
          </button>
        ))}
      </div>

      <div className="spacer-16" />
    </div>
  )
}
