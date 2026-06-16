import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { useToast } from '../contexts/ToastContext'
import { haptic } from '../utils/telegram'
import { BUILDER_FLOWERS } from '../data/products'

export default function Builder() {
  const navigate = useNavigate()
  const { t, lang, formatPrice } = useI18n()
  const { showToast } = useToast()
  const [counts, setCounts] = useState({})

  const totalFlowers = Object.values(counts).reduce((s, v) => s + v, 0)
  const totalPrice   = BUILDER_FLOWERS.reduce((s, f) => s + (counts[f.id] || 0) * f.price, 0)

  const toggleFlower = useCallback((id) => {
    setCounts(prev => {
      const next = (prev[id] || 0) + 1
      if (next > 10) { const { [id]: _, ...rest } = prev; return rest }
      return { ...prev, [id]: next }
    })
    haptic.light?.()
  }, [])

  const clear = () => { setCounts({}); haptic.light?.() }

  const order = () => {
    if (totalFlowers === 0) {
      showToast(lang === 'uz' ? 'Avval gul tanlang' : lang === 'ru' ? 'Сначала выберите цветы' : 'Choose flowers first', 'warning')
      return
    }
    showToast(lang === 'uz' ? "Bouquet buyurtmasi qabul qilindi!" : lang === 'ru' ? "Заказ букета принят!" : "Bouquet order placed!", 'success')
    haptic.success?.()
    clear()
    navigate('/')
  }

  const canvasFlowers = BUILDER_FLOWERS.flatMap(f =>
    Array.from({ length: counts[f.id] || 0 }, (_, i) => ({ id: `${f.id}-${i}`, emoji: f.emoji }))
  )

  return (
    <div className="page page-top-pad">
      <div style={{ padding: '0 16px 8px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400 }}>{t('builder.title')}</h2>
      </div>

      {/* Canvas */}
      <div className="builder-canvas">
        {canvasFlowers.length === 0 ? (
          <div className="builder-placeholder">
            🌸<br />{t('builder.canvas')}
          </div>
        ) : (
          canvasFlowers.map(f => (
            <span key={f.id} className="builder-flower">{f.emoji}</span>
          ))
        )}
      </div>

      {/* Summary bar */}
      <div className="builder-summary-bar">
        <div style={{ padding: '0 16px' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>{totalFlowers} {t('builder.count')}</span>
        </div>
        <div style={{ padding: '0 16px', fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--color-rose-dark)', fontWeight: 600 }}>
          {totalFlowers > 0 ? formatPrice(totalPrice) : '—'}
        </div>
      </div>

      {/* Flower palette */}
      <div style={{ padding: '8px 16px 8px', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--color-text-mid)' }}>
        {t('builder.flowers')}
      </div>
      <div className="flower-palette">
        {BUILDER_FLOWERS.map(f => {
          const cnt = counts[f.id] || 0
          return (
            <div
              key={f.id}
              className={`flower-option${cnt > 0 ? ' selected' : ''}`}
              onClick={() => toggleFlower(f.id)}
            >
              {cnt > 0 && <span className="flower-count">{cnt}</span>}
              <span className="flower-emoji">{f.emoji}</span>
              <span className="flower-name">{f.name[lang] || f.name.uz}</span>
              <span className="flower-price">{formatPrice(f.price)}</span>
            </div>
          )
        })}
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 12 }}>
        {totalFlowers > 0 && (
          <button className="btn-secondary" style={{ flex: 0, padding: '0 20px' }} onClick={clear}>
            {t('builder.clear')}
          </button>
        )}
        <button className="btn-primary" style={{ flex: 1 }} onClick={order}>
          🌸 {t('builder.order')} {totalFlowers > 0 ? `(${formatPrice(totalPrice)})` : ''}
        </button>
      </div>
    </div>
  )
}
