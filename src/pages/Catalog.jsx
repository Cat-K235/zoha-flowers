import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { CATEGORIES, getProductsByCategory } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Catalog() {
  const [searchParams] = useSearchParams()
  const initCat = searchParams.get('cat') || 'all'
  const [activeCategory, setActiveCategory] = useState(initCat)
  const { t } = useI18n()

  useEffect(() => {
    const cat = searchParams.get('cat') || 'all'
    setActiveCategory(cat)
  }, [searchParams])

  const products = getProductsByCategory(activeCategory)

  return (
    <div className="page page-top-pad">
      {/* Category filter */}
      <div className="filter-row" style={{ paddingBottom: 16 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`filter-chip${activeCategory === cat.id ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.emoji} {t(cat.nameKey, cat.name)}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="products-grid">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      <div className="spacer-16" />
    </div>
  )
}
