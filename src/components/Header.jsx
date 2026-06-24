import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useI18n } from '../contexts/I18nContext'
import Modal from './Modal'

const PAGE_TITLES = {
  '/catalog': 'nav.catalog', '/cart': 'cart.title', '/checkout': 'checkout.title',
  '/account': 'account.title', '/favorites': 'nav.favorites', '/builder': 'nav.builder',
  '/orders': 'account.orders', '/admin': 'admin.title', '/contacts': 'account.contacts',
  '/search': null,
}

export default function Header({ onSearch }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { count } = useCart()
  const { lang, setLang, t } = useI18n()
  const [langOpen, setLangOpen] = useState(false)

  const isHome = location.pathname === '/'
  const canGoBack = location.pathname !== '/'
  const titleKey = PAGE_TITLES[location.pathname]

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          {canGoBack && (
            <button className="btn-back" onClick={() => navigate(-1)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
          )}

          {isHome ? (
            <div className="header-logo" style={{ flex: 1 }}>
              <img
                className="logo-img"
                src="./zoha-logo.png"
                alt="logo"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline' }}
              />
              <span className="logo-icon" style={{ display: 'none' }}>🌸</span>
              <span className="logo-text">Zoha Flowers</span>
            </div>
          ) : (
            <div className="header-title" style={{ flex: 1 }}>
              {titleKey ? t(titleKey) : location.pathname.replace('/', '')}
            </div>
          )}

          <div className="header-actions">
            {isHome && (
              <button className="btn-icon" onClick={onSearch} title="Search">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            )}
            <button className="btn-icon" onClick={() => navigate('/cart')} title="Cart">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
            <button className="btn-icon btn-lang" onClick={() => setLangOpen(true)}>
              {lang.toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <Modal open={langOpen} onClose={() => setLangOpen(false)} title={t('lang.select')}>
        <div className="lang-options">
          {[
            { code: 'uz', flag: '🇺🇿', name: "O'zbek", native: "Uzbekcha" },
            { code: 'ru', flag: '🇷🇺', name: "Русский", native: "Russian" },
            { code: 'en', flag: '🇬🇧', name: "English", native: "Inglizcha" },
          ].map(l => (
            <div
              key={l.code}
              className={`lang-option${lang === l.code ? ' active' : ''}`}
              onClick={() => { setLang(l.code); setLangOpen(false) }}
            >
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-name">{l.name}</span>
              <span className="lang-native">{l.native}</span>
              {lang === l.code && <span style={{ color: 'var(--color-rose-dark)', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
