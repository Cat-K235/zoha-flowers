import React from 'react'
import { useI18n } from '../contexts/I18nContext'

export default function Addresses() {
  const { lang } = useI18n()
  const addresses = JSON.parse(localStorage.getItem('zf_addresses') || '[]')

  return (
    <div className="page page-top-pad">
      <div style={{ padding: '0 16px' }}>
        {addresses.length ? addresses.map((a, i) => (
          <div key={i} className="form-section" style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{a.label}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-mid)', marginTop: 4 }}>{a.address}</div>
          </div>
        )) : (
          <div className="cart-empty">
            <div className="cart-empty-icon">🏠</div>
            <h2 className="cart-empty-title">
              {lang === 'uz' ? "Manzillar yo'q" : lang === 'ru' ? 'Нет адресов' : 'No saved addresses'}
            </h2>
          </div>
        )}
      </div>
    </div>
  )
}
