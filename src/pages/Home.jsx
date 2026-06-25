import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { useCart } from '../contexts/CartContext'
import { useProducts } from '../contexts/ProductContext'
import { REVIEWS } from '../data/products'
import ProductCard from '../components/ProductCard'
import { openLink } from '../utils/telegram'

const PETALS = Array.from({ length: 8 }, (_, i) => ({
  style: { left: `${10 + i * 12}%`, animationDuration: `${4 + i * 0.5}s`, animationDelay: `${i * 0.7}s` },
}))

function ProductSection({ titleKey, products, onSeeAll }) {
  const { t } = useI18n()
  if (!products.length) return null
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">{t(titleKey)}</h2>
        <button className="section-link" onClick={onSeeAll}>{t('section.seeAll')}</button>
      </div>
      <div className="products-scroll">
        {products.slice(0, 6).map(p => <ProductCard key={p.id} product={p} scroll />)}
      </div>
    </section>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const { isFirstOrder } = useCart()
  const { categories, getFeatured, getBestSellers, getNewArrivals, getSeasonal } = useProducts()

  const reviewsTitle = lang === 'ru' ? 'Отзывы клиентов' : lang === 'en' ? 'Customer Reviews' : 'Mijozlar sharhlari'
  const contactBtn  = lang === 'ru' ? 'Связаться' : lang === 'en' ? 'Contact Us' : 'Aloqa'

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-petals">
          {PETALS.map((p, i) => <span key={i} className="hero-petal" style={p.style}>🌸</span>)}
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            <span>{t('hero.badge')}</span>
          </div>
          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-sub">{t('hero.sub')}</p>
          <button className="hero-cta ripple" onClick={() => navigate('/catalog')}>
            <span>🌸</span>
            <span>{t('hero.cta')}</span>
          </button>
        </div>
      </div>

      {/* First-order promo */}
      {isFirstOrder && (
        <div className="promo-strip animate-fade-in">
          <div className="promo-text">
            <div className="promo-label">{t('promo.label')}</div>
            <div className="promo-value">{t('promo.value')}</div>
          </div>
          <button className="promo-btn" onClick={() => navigate('/catalog')}>{t('promo.btn')}</button>
        </div>
      )}

      {/* Category pills */}
      <section className="section">
        <div className="categories-scroll">
          {categories.filter(c => c.id !== 'all').map(cat => (
            <div key={cat.id} className="category-pill" onClick={() => navigate(`/catalog?cat=${cat.id}`)}>
              <div className="pill-icon">{cat.emoji}</div>
              <span className="pill-label">{t(cat.nameKey, cat.name)}</span>
            </div>
          ))}
        </div>
      </section>

      <ProductSection titleKey="section.featured"    products={getFeatured()}    onSeeAll={() => navigate('/catalog')} />
      <ProductSection titleKey="section.bestsellers" products={getBestSellers()} onSeeAll={() => navigate('/catalog')} />
      <ProductSection titleKey="section.new"         products={getNewArrivals()} onSeeAll={() => navigate('/catalog')} />
      <ProductSection titleKey="section.seasonal"    products={getSeasonal()}    onSeeAll={() => navigate('/catalog')} />

      {/* Reviews */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">⭐ {reviewsTitle}</h2>
        </div>
        <div className="reviews-list">
          {REVIEWS.slice(0, 3).map(r => (
            <div key={r.id} className="review-card animate-fade-in">
              <div className="review-header">
                <div className="reviewer-avatar">{r.avatar}</div>
                <div>
                  <div className="reviewer-name">{r.name}</div>
                  <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                </div>
                <div className="reviewer-date" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-light)' }}>{r.date}</div>
              </div>
              <div className="review-text">{r.text[lang] || r.text.uz}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact strip */}
      <section className="section">
        <div style={{ margin: '0 16px', background: 'linear-gradient(135deg,var(--color-beige) 0%,var(--color-beige-mid) 100%)', borderRadius: 'var(--radius-xl)', padding: '20px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📞</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 4 }}>+998 94 487 00 97</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-mid)', marginBottom: 16 }}>Telegram: @Zoxaflowers • 24/7</div>
          <button
            className="btn-primary"
            style={{ width: '100%', maxWidth: 220, margin: '0 auto' }}
            onClick={() => navigate('/contacts')}
          >
            {contactBtn}
          </button>
        </div>
      </section>

      <div className="spacer-16" />
    </div>
  )
}
