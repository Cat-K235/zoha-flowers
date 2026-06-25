import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { useCart } from '../contexts/CartContext'
import { useTelegram } from '../contexts/TelegramContext'
import { useToast } from '../contexts/ToastContext'
import { sendOrderToBot, haptic } from '../utils/telegram'
import { uploadPaymentScreenshot } from '../utils/supabase'

const TIME_SLOTS = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00']
const CARD_NUMBER = '9860 3501 4114 1845'

export default function Checkout() {
  const navigate = useNavigate()
  const { t, lang, formatPrice } = useI18n()
  const { getCartItems, getDelivery, getDiscount, getTotal, clear, markOrdered } = useCart()
  const { user } = useTelegram()
  const { showToast } = useToast()

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [time, setTime] = useState(TIME_SLOTS[0])
  const [address, setAddress] = useState('')
  const [name, setName] = useState(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '')
  const [phone, setPhone] = useState('')
  const [greeting, setGreeting] = useState('')
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState('cash')

  const cartItems = getCartItems()
  const delivery  = getDelivery()
  const discount  = getDiscount()
  const total     = getTotal()

  const addrPlaceholder  = lang === 'ru' ? 'Улица, номер дома' : lang === 'en' ? 'Street, house number' : "Ko'cha, uy raqami"
  const namePlaceholder  = lang === 'ru' ? 'Имя и фамилия' : lang === 'en' ? 'Full name' : 'Ism va familiya'
  const cardPlaceholder  = lang === 'ru' ? 'Введите текст открытки...' : lang === 'en' ? 'Enter your greeting message...' : "Tabriq so'zlaringizni kiriting..."
  const notesPlaceholder = lang === 'ru' ? 'Дополнительные пожелания...' : lang === 'en' ? 'Additional notes...' : "Qo'shimcha izoh..."

  const [copied, setCopied] = useState(false)
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const copyCard = () => {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, '')).then(() => {
      setCopied(true)
      haptic.success?.()
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      showToast('Copy failed', 'error')
    })
  }

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshot(file)
    const reader = new FileReader()
    reader.onload = (ev) => setScreenshotPreview(ev.target.result)
    reader.readAsDataURL(file)
    haptic.light?.()
  }

  const removeScreenshot = () => {
    setScreenshot(null)
    setScreenshotPreview(null)
  }

  const errMsg = (key) => ({ uz: { addr: 'Manzilni kiriting', name: 'Ism kiriting', phone: 'Telefon raqamini kiriting' }, ru: { addr: 'Введите адрес', name: 'Введите имя', phone: 'Введите телефон' }, en: { addr: 'Enter delivery address', name: 'Enter recipient name', phone: 'Enter phone number' } }[lang] || {})[key]

  const submit = async () => {
    if (!address.trim()) { showToast(errMsg('addr'), 'error'); haptic.error?.(); return }
    if (!name.trim())    { showToast(errMsg('name'), 'error'); haptic.error?.(); return }
    if (!phone.trim())   { showToast(errMsg('phone'), 'error'); haptic.error?.(); return }
    if (payment === 'card' && !screenshot) {
      const msg = lang === 'ru' ? 'Загрузите скриншот оплаты' : lang === 'en' ? 'Upload payment screenshot' : "To'lov screenshotini yuklang"
      showToast(msg, 'error'); haptic.error?.(); return
    }

    const orderId = 'ZF-' + Date.now().toString().slice(-6)

    let paymentScreenshot = null
    if (payment === 'card' && screenshot) {
      setUploading(true)
      paymentScreenshot = await uploadPaymentScreenshot(screenshot, orderId)
      setUploading(false)
      if (!paymentScreenshot) {
        const msg = lang === 'ru' ? 'Ошибка загрузки скриншота' : lang === 'en' ? 'Screenshot upload failed' : "Screenshot yuklab bo'lmadi"
        showToast(msg, 'error'); haptic.error?.(); return
      }
    }

    const orderData = {
      orderId,
      chatId: user?.id || null,
      items: cartItems.map(i => ({ name: i.product.name.uz, qty: i.qty, price: i.product.price })),
      total, address, recipientName: name, phone, date, time, payment, greeting, notes, lang,
      ...(paymentScreenshot && { paymentScreenshot }),
    }

    const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]')
    orders.unshift({ ...orderData, status: 0, statusHistory: [{ status: 0, time: new Date().toLocaleTimeString() }] })
    localStorage.setItem('zf_orders', JSON.stringify(orders))

    sendOrderToBot(orderData)
    markOrdered()
    clear()
    haptic.success?.()
    navigate('/order-success', { state: { orderId } })
  }

  return (
    <div className="page page-top-pad">
      {/* Delivery */}
      <div className="form-section">
        <div className="form-section-title">{t('checkout.delivery')}</div>
        <div className="form-group">
          <label className="form-label">{t('checkout.date')}</label>
          <input className="form-input" type="date" value={date} min={today} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('checkout.time')}</label>
          <div className="time-slots">
            {TIME_SLOTS.map(slot => (
              <button key={slot} className={`time-slot${time === slot ? ' active' : ''}`} onClick={() => setTime(slot)}>{slot}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('checkout.address')}</label>
          <input className="form-input" type="text" value={address} placeholder={addrPlaceholder} onChange={e => setAddress(e.target.value)} />
        </div>
      </div>

      {/* Recipient */}
      <div className="form-section">
        <div className="form-section-title">{t('checkout.recipient')}</div>
        <div className="form-group">
          <label className="form-label">{t('checkout.name')}</label>
          <input className="form-input" type="text" value={name} placeholder={namePlaceholder} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('checkout.phone')}</label>
          <input className="form-input" type="tel" value={phone} placeholder="+998 90 000 00 00" onChange={e => setPhone(e.target.value)} />
        </div>
      </div>

      {/* Greeting */}
      <div className="form-section">
        <div className="form-section-title">{t('checkout.card')}</div>
        <div className="form-group">
          <textarea className="form-textarea" rows={3} value={greeting} placeholder={cardPlaceholder} onChange={e => setGreeting(e.target.value)} />
        </div>
      </div>

      {/* Notes */}
      <div className="form-section">
        <div className="form-section-title">{t('checkout.notes')}</div>
        <div className="form-group">
          <textarea className="form-textarea" rows={2} value={notes} placeholder={notesPlaceholder} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      {/* Payment */}
      <div className="form-section">
        <div className="form-section-title">{t('checkout.payment')}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`time-slot${payment === 'cash' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setPayment('cash')}>{t('checkout.cash')}</button>
          <button className={`time-slot${payment === 'card' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setPayment('card')}>{t('checkout.card_pay')}</button>
        </div>
        {payment === 'card' && (<>
          <div style={{
            marginTop: 12,
            background: 'linear-gradient(135deg, #2a1f1f 0%, #4a3636 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            color: '#fff',
          }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              {lang === 'ru' ? 'Переведите на карту' : lang === 'en' ? 'Transfer to card' : "Kartaga o'tkazing"}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 18, letterSpacing: 2, fontWeight: 600 }}>
                {CARD_NUMBER}
              </span>
              <button
                onClick={copyCard}
                style={{
                  background: copied ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied
                  ? (lang === 'ru' ? 'Скопировано!' : lang === 'en' ? 'Copied!' : 'Nusxalandi!')
                  : (lang === 'ru' ? 'Копировать' : lang === 'en' ? 'Copy' : 'Nusxalash')}
              </button>
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 8 }}>
              {lang === 'ru'
                ? 'Переведите сумму заказа и загрузите скриншот'
                : lang === 'en'
                ? 'Transfer the order amount and upload a screenshot'
                : "Buyurtma summasini o'tkazing va screenshotini yuklang"}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {!screenshotPreview ? (
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                border: '2px dashed var(--color-beige-mid)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 16px',
                cursor: 'pointer',
                color: 'var(--color-text-mid)',
                fontSize: 13,
                transition: 'border-color 0.2s',
              }}>
                <span style={{ fontSize: 20 }}>📸</span>
                <span>
                  {lang === 'ru' ? 'Загрузить скриншот оплаты' : lang === 'en' ? 'Upload payment screenshot' : "To'lov screenshotini yuklang"}
                </span>
                <input type="file" accept="image/*" onChange={handleScreenshot} style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{ position: 'relative' }}>
                <img
                  src={screenshotPreview}
                  alt="Payment"
                  style={{
                    width: '100%', borderRadius: 'var(--radius-lg)',
                    maxHeight: 200, objectFit: 'cover',
                    border: '2px solid var(--color-rose)',
                  }}
                />
                <button
                  onClick={removeScreenshot}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    border: 'none', borderRadius: '50%',
                    width: 28, height: 28, fontSize: 14,
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
                <div style={{
                  marginTop: 6, fontSize: 12, color: 'var(--color-success)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  ✓ {lang === 'ru' ? 'Скриншот прикреплён' : lang === 'en' ? 'Screenshot attached' : 'Screenshot biriktirildi'}
                </div>
              </div>
            )}
          </div>
        </>)}
      </div>

      {/* Order summary */}
      <div className="cart-summary" style={{ margin: '0 16px 12px' }}>
        {cartItems.map(item => (
          <div key={item.id} className="summary-row">
            <span className="summary-label">{(item.product.name[lang] || item.product.name.uz)} ×{item.qty}</span>
            <span style={{ fontFamily: 'var(--font-serif)' }}>{formatPrice(item.product.price * item.qty)}</span>
          </div>
        ))}
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

      <div className="checkout-btn-wrap">
        <button className="btn-checkout" onClick={submit} disabled={uploading}>
          {uploading
            ? (lang === 'ru' ? '⏳ Загрузка...' : lang === 'en' ? '⏳ Uploading...' : "⏳ Yuklanmoqda...")
            : `✓ ${t('checkout.confirm')}`}
        </button>
      </div>
      <div className="spacer-16" />
    </div>
  )
}
