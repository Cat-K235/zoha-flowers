import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'

export default function OrderSuccess() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { t } = useI18n()
  const orderId = state?.orderId || 'ZF-' + Date.now().toString().slice(-6)

  return (
    <div className="page">
      <div className="order-success">
        <div className="success-icon">🌸</div>
        <h1 className="success-title">{t('order.success')}</h1>
        <p className="success-text">{t('order.success.text')}</p>
        <div className="order-number">
          {t('order.number')}: <span>{orderId}</span>
        </div>
        <button className="btn-primary" style={{ width: 200, marginBottom: 12 }} onClick={() => navigate('/orders')}>
          📦 {t('order.track')}
        </button>
        <button className="btn-secondary" style={{ width: 200 }} onClick={() => navigate('/')}>
          🏠 {t('nav.home')}
        </button>
      </div>
    </div>
  )
}
