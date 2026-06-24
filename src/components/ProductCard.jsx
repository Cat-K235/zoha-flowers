import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useI18n } from '../contexts/I18nContext'
import { useToast } from '../contexts/ToastContext'
import { useTelegram } from '../contexts/TelegramContext'
import { haptic } from '../utils/telegram'

export default function ProductCard({ product, scroll = false }) {
  const navigate = useNavigate()
  const { add, toggleFav, isFav } = useCart()
  const { lang, formatPrice } = useI18n()
  const { showToast } = useToast()
  const { isAdmin } = useTelegram()

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

  const handleEdit = (e) => {
    e.stopPropagation()
    navigate(`/admin?edit=${product.id}`)
    haptic.light?.()
  }

  return (
    <div
      className="product-card"
      style={scroll ? {} : {}}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-img">
        {product.image ? (
          <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>{product.emoji}</span>
        )}
        {product.badge && (
          <span className={`product-badge ${product.badge}`}>
            {product.badge === 'new' ? 'NEW' : 'SALE'}
          </span>
        )}
        <button className={`btn-fav${fav ? ' active' : ''}`} onClick={handleFav}>
          {fav ? '❤️' : '🤍'}
        </button>
        {isAdmin && (
          <button className="btn-admin-edit" onClick={handleEdit}>✏️</button>
        )}
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
