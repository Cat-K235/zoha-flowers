import React from 'react'
import { useI18n } from '../contexts/I18nContext'
import { useCart } from '../contexts/CartContext'
import ProductCard from '../components/ProductCard'

export default function Favorites() {
  const { t } = useI18n()
  const { getFavoriteProducts } = useCart()
  const favorites = getFavoriteProducts()

  if (favorites.length === 0) {
    return (
      <div className="page">
        <div className="cart-empty">
          <div className="cart-empty-icon">❤️</div>
          <div className="cart-empty-title">{t('favorites.empty')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page page-top-pad">
      <div className="products-grid">
        {favorites.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      <div className="spacer-16" />
    </div>
  )
}
