import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'

export default function Cart() {
  const navigate = useNavigate()
  const { t, lang, formatPrice } = useI18n()
  const { getCartItems, remove, updateQty, getSubtotal, getDelivery, getDiscount, getTotal, applyPromo, appliedPromo } = useCart()
  const { showToast } = useToast()
  const [promoCode, setPromoCode] = useState('')

  const cartItems = getCartItems()
  const subtotal  = getSubtotal()
  const delivery  = getDelivery()
  const discount  = getDiscount()
  const total     = getTotal()

  const handleApplyPromo = () => {
    const result = applyPromo(promoCode)
    if (result.ok) {
      showToast(`✓ ${result.percent}% ${lang === 'uz' ? 'chegirma qo\'llanildi' : lang === 'ru' ? 'скидка применена' : 'discount applied'}`, 'success')
    } else {
      showToast(lang === 'uz' ? 'Promo kod topilmadi' : lang === 'ru' ? 'Промокод не найден' : 'Promo code not found', 'error')
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <div className="cart-empty-title">{t('cart.empty')}</div>
          <div className="cart-empty-text">{t('cart.empty.sub')}</div>
          <button className="btn-primary" style={{ marginTop: 24, width: 200 }} onClick={() => navigate('/catalog')}>
            🌸 {t('hero.cta')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page page-top-pad">
      {/* Cart items */}
      <div className="cart-list">
        {cartItems.map(item => {
          const name = item.product.name[lang] || item.product.name.uz
          return (
            <div key={item.id} className="cart-item">
              <div className="cart-item-img">{item.product.emoji}</div>
              <div className="cart-item-info">
                <div className="cart-item-name">{name}</div>
                <div className="cart-item-price">{formatPrice(item.product.price * item.qty)}</div>
                <div className="cart-item-controls">
                  <div className="cart-qty">
                    <button className="cart-qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span className="cart-qty-val">{item.qty}</span>
                    <button className="cart-qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <button className="cart-item-remove" onClick={() => remove(item.id)}>✕</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Promo code */}
      {!appliedPromo && (
        <div className="promo-input-row">
          <input
            className="promo-input"
            placeholder={t('cart.promo')}
            value={promoCode}
            onChange={e => setPromoCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
          />
          <button className="promo-apply" onClick={handleApplyPromo}>{t('cart.apply')}</button>
        </div>
      )}
      {appliedPromo && (
        <div style={{ padding: '4px 16px 8px', fontSize: 13, color: 'var(--color-success)', fontWeight: 500 }}>
          ✓ Promo: {appliedPromo}
        </div>
      )}

      {/* Summary */}
      <div className="cart-summary">
        <div className="summary-row">
          <span className="summary-label">{t('cart.subtotal')}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">{t('cart.delivery')}</span>
          <span>{delivery === 0 ? t('free') : formatPrice(delivery)}</span>
        </div>
        {discount > 0 && (
          <div className="summary-row">
            <span className="summary-label summary-discount">{t('cart.discount')}</span>
            <span className="summary-discount">−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>{t('cart.total')}</span>
          <span className="amount">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Checkout button */}
      <div className="checkout-btn-wrap">
        <button className="btn-checkout" onClick={() => navigate('/checkout')}>
          ✓ {t('cart.checkout')}
        </button>
      </div>
      <div className="spacer-16" />
    </div>
  )
}
