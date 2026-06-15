import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { haptic } from '../utils/telegram'
import { getProductById, PRODUCTS } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang, t, formatPrice } = useI18n()
  const { add } = useCart()
  const { showToast } = useToast()
  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)

  const product = getProductById(id)
  if (!product) {
    return <div className="page page-top-pad" style={{ padding: 24, textAlign: 'center' }}>Product not found</div>
  }

  const name = product.name[lang] || product.name.uz
  const desc = product.desc[lang] || product.desc.uz
  const images = [product.emoji, '💐', '🌸']

  const handleAdd = () => {
    add(product.id, qty)
    showToast(`🌸 ${name} — ${t('product.add')}`, 'success')
    haptic.success?.()
  }

  const handleBuy = () => {
    add(product.id, qty)
    navigate('/checkout')
  }

  const similar = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="page">
      {/* Gallery */}
      <div className="product-gallery">
        <div className="gallery-main">{images[imgIdx]}</div>
        <div className="gallery-dots">
          {images.map((_, i) => (
            <button key={i} className={`gallery-dot${imgIdx === i ? ' active' : ''}`} onClick={() => setImgIdx(i)} />
          ))}
        </div>
      </div>

      <div className="product-detail-body">
        {/* Header */}
        <div className="product-detail-header">
          <h1 className="product-detail-name">{name}</h1>
          <span className="product-detail-price">{formatPrice(product.price)}</span>
        </div>

        {/* Rating */}
        <div className="product-rating">
          <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
          <span className="rating-count">{product.rating} ({product.reviews} {lang === 'uz' ? 'sharh' : lang === 'ru' ? 'отзывов' : 'reviews'})</span>
        </div>

        {/* Description */}
        <p className="product-desc">{desc}</p>

        {/* Composition */}
        <div className="composition-box">
          <div className="composition-title">{t('product.composition')}</div>
          <div className="composition-items">
            {product.composition.map((item, i) => (
              <span key={i} className="composition-tag">{item}</span>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="quantity-selector">
          <span className="qty-label">{t('product.qty')}:</span>
          <div className="qty-controls">
            <button className="btn-qty" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span className="qty-value">{qty}</span>
            <button className="btn-qty" onClick={() => setQty(q => q + 1)}>+</button>
          </div>
        </div>

        {/* Actions */}
        <div className="detail-actions">
          <button className="btn-primary" onClick={handleAdd}>🛒 {t('product.add')}</button>
          <button className="btn-secondary" onClick={handleBuy}>⚡ {t('product.buy')}</button>
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">{t('product.similar')}</h2>
            </div>
            <div className="products-scroll">
              {similar.map(p => <ProductCard key={p.id} product={p} scroll />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
