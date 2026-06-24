import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { useProducts } from '../contexts/ProductContext'
import ProductCard from '../components/ProductCard'

export default function Search() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { categories, searchProducts, getProductsByCategory } = useProducts()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const results = useMemo(() => {
    if (query.trim().length < 2 && category === 'all') return []
    const byQuery = query.trim().length >= 2 ? searchProducts(query) : getProductsByCategory('all')
    if (category === 'all') return byQuery
    return byQuery.filter(p => p.category === category)
  }, [query, category])

  return (
    <div className="page">
      {/* Search bar */}
      <div className="search-bar-wrap">
        <div className="search-input-row">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            autoFocus
            className="search-input"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="filter-row">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-chip${category === cat.id ? ' active' : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.emoji} {t(cat.nameKey, cat.name)}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="products-grid" style={{ padding: '0 16px' }}>
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : query.length >= 2 ? (
        <div className="cart-empty" style={{ paddingTop: 40 }}>
          <div className="cart-empty-icon">🔍</div>
          <div className="cart-empty-title">{t('search.empty')}</div>
        </div>
      ) : null}

      <div className="spacer-16" />
    </div>
  )
}
