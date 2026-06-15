import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useI18n } from '../contexts/I18nContext'
import { useToast } from '../contexts/ToastContext'
import { haptic } from '../utils/telegram'

export default function ProductCard({ product, scroll = false }) {
  const navigate = useNavigate()
  const { add, toggleFav, isFav } = useCart()
  const { lang, formatPrice } = useI18n()
  const { showToast } = useToast()

  const name = product.name[lang] || product.name.uz
  const fav = isFav(product.id)

  const handleAdd = (e) => {
    e.stopPropagation()
    add(product.id)
    showToast(`🌸 ${name}`, 'success')
    haptic.success?.()
  }

  const handleFav = (e) => {
    e.stopPropagation()
    toggleFav(product.id)
    haptic.light?.()
  }

  return (
    <div
      className="product-card"
      style={scroll ? {} : {}}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-img">
        <span>{product.emoji}</span>
        {product.badge && (
          <span className={`product-badge ${product.badge}`}>
            {product.badge === 'new' ? 'NEW' : 'SALE'}
          </span>
        )}
        <button className={`btn-fav${fav ? ' active' : ''}`} onClick={handleFav}>
          {fav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="product-info">
        <div className="product-name">{name}</div>
        <div className="product-sub">★ {product.rating} ({product.reviews})</div>
        <div className="product-footer">
          <div className="product-price">
            {formatPrice(product.price)}
            {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
          </div>
          <button className="btn-add-quick" onClick={handleAdd}>+</button>
        </div>
      </div>
    </div>
  )
}
