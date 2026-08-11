import React from 'react'
import { useI18n } from '../contexts/I18nContext'
import { openLink, openTelegramLink } from '../utils/telegram'

export default function Contacts() {
  const { t } = useI18n()

  const workingHours = localStorage.getItem('zf_working_hours') || t('contact.hours_val')
  const contacts = [
    {
      icon: '📞',
      label: t('contact.phone'),
      value: '+998 94 487 00 97',
      onClick: () => openLink('tel:+998944870097'),
    },
    {
      icon: '✈️',
      label: t('contact.telegram'),
      value: '@Zoxaflowers',
      onClick: () => openTelegramLink('https://t.me/Zoxaflowers'),
    },
    {
      icon: '🕐',
      label: t('contact.hours'),
      value: workingHours,
      onClick: null,
    },
    {
      icon: '📍',
      label: 'Instagram',
      value: '@zoxaflowers',
      onClick: () => openLink('https://instagram.com/zoxaflowers'),
    },
  ]

  return (
    <div className="page page-top-pad">
      {/* Logo header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 8px' }}>
        <img
          src="./zoha-logo.svg"
          alt="Zoxa Flowers"
          style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 16, marginBottom: 12 }}
          onError={e => { e.target.style.display = 'none' }}
        />
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, marginBottom: 4 }}>Zoxa Flowers</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-light)', letterSpacing: 2, textTransform: 'uppercase' }}>
          Premium Flower Boutique
        </div>
      </div>

      <div className="contact-cards">
        {contacts.map((c, i) => (
          <button
            key={i}
            className="contact-card"
            onClick={c.onClick || undefined}
            style={{ cursor: c.onClick ? 'pointer' : 'default' }}
          >
            <div className="contact-icon">{c.icon}</div>
            <div>
              <div className="contact-label">{c.label}</div>
              <div className="contact-value">{c.value}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="spacer-16" />
    </div>
  )
}
