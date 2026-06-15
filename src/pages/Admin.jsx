import React from 'react'
import { useI18n } from '../contexts/I18nContext'
import { useTelegram } from '../contexts/TelegramContext'

export default function Admin() {
  const { t, formatPrice } = useI18n()
  const { isAdmin } = useTelegram()

  const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]')
  const todayTotal  = orders.filter(o => o.date === new Date().toISOString().split('T')[0]).reduce((s, o) => s + o.total, 0)
  const monthTotal  = orders.reduce((s, o) => s + o.total, 0)

  const quickActions = [
    { icon: '📦', label: t('admin.products'), count: '12' },
    { icon: '🗂️', label: t('admin.categories'), count: '7' },
    { icon: '📋', label: t('admin.orders'), count: `${orders.length}` },
    { icon: '⭐', label: t('admin.reviews'), count: '5' },
    { icon: '📊', label: t('admin.analytics'), count: '' },
    { icon: '🎁', label: t('admin.promo'), count: '3' },
  ]

  if (!isAdmin) {
    return (
      <div className="page page-top-pad" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>Access denied</div>
      </div>
    )
  }

  return (
    <div className="page page-top-pad">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">{orders.filter(o => o.date === new Date().toISOString().split('T')[0]).length}</div>
          <div className="stat-label">{t('admin.stats.today')}</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{todayTotal > 0 ? formatPrice(todayTotal) : '0'}</div>
          <div className="stat-label">{t('admin.stats.month')}</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">{t('admin.stats.total')}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="admin-grid">
        {quickActions.map((a, i) => (
          <div key={i} className="admin-card press-scale">
            <div className="admin-card-icon">{a.icon}</div>
            <div className="admin-card-label">{a.label}</div>
            {a.count && <div className="admin-card-count">{a.count}</div>}
          </div>
        ))}
      </div>

      {/* Recent orders */}
      {orders.length > 0 && (
        <>
          <div style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--color-text-mid)' }}>
            {t('admin.orders')}
          </div>
          <div className="orders-list" style={{ paddingTop: 0 }}>
            {orders.slice(0, 5).map((o, i) => (
              <div key={i} className="order-card">
                <div className="order-card-header">
                  <span className="order-id">{o.orderId}</span>
                  <span className="order-date">{o.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-mid)' }}>
                    {o.recipientName} • {o.phone}
                  </span>
                  <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-rose-dark)', fontWeight: 600 }}>
                    {formatPrice(o.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="spacer-16" />
    </div>
  )
}
