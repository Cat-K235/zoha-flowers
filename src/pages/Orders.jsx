import React, { useState } from 'react'
import { useI18n } from '../contexts/I18nContext'

const STATUS_LABELS = ['order.status.accepted', 'order.status.preparing', 'order.status.courier', 'order.status.delivered']

export default function Orders() {
  const { t, formatPrice } = useI18n()
  const [orders] = useState(() => JSON.parse(localStorage.getItem('zf_orders') || '[]'))

  if (orders.length === 0) {
    return (
      <div className="page">
        <div className="cart-empty">
          <div className="cart-empty-icon">📦</div>
          <div className="cart-empty-title">{t('account.orders')}</div>
          <div className="cart-empty-text" style={{ marginTop: 8 }}>
            {t('cart.empty.sub')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page page-top-pad">
      <div className="orders-list">
        {orders.map((order, i) => (
          <div key={i} className="order-card">
            <div className="order-card-header">
              <span className="order-id">{order.orderId}</span>
              <span className="order-date">{order.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className={`order-status-badge status-${order.status}`}>
                {t(STATUS_LABELS[order.status] || STATUS_LABELS[0])}
              </span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--color-rose-dark)', fontWeight: 600 }}>
                {formatPrice(order.total)}
              </span>
            </div>
            {order.address && (
              <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>📍 {order.address}</div>
            )}

            {/* Tracking steps */}
            <div className="tracking-steps" style={{ paddingTop: 12, paddingBottom: 0 }}>
              {STATUS_LABELS.map((key, idx) => {
                const done = order.status > idx
                const active = order.status === idx
                const historyItem = order.statusHistory?.find(h => h.status === idx)
                return (
                  <div key={idx} className={`tracking-step${done ? ' done' : active ? ' active' : ''}`}>
                    <div className="step-icon">{done ? '✓' : ['📋', '🌸', '🚗', '✅'][idx]}</div>
                    <div className="step-content">
                      <div className="step-label">{t(key)}</div>
                      {historyItem && <div className="step-time">{historyItem.time}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="spacer-16" />
    </div>
  )
}
