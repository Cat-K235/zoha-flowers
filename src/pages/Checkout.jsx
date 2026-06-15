import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { useCart } from '../contexts/CartContext'
import { useTelegram } from '../contexts/TelegramContext'
import { useToast } from '../contexts/ToastContext'
import { sendOrderToBot, haptic } from '../utils/telegram'

const TIME_SLOTS = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00']

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

  const errMsg = (key) => ({ uz: { addr: 'Manzilni kiriting', name: 'Ism kiriting', phone: 'Telefon raqamini kiriting' }, ru: { addr: 'Введите адрес', name: 'Введите имя', phone: 'Введите телефон' }, en: { addr: 'Enter delivery address', name: 'Enter recipient name', phone: 'Enter phone number' } }[lang] || {})[key]

  const submit = () => {
    if (!address.trim()) { showToast(errMsg('addr'), 'error'); haptic.error?.(); return }
    if (!name.trim())    { showToast(errMsg('name'), 'error'); haptic.error?.(); return }
    if (!phone.trim())   { showToast(errMsg('phone'), 'error'); haptic.error?.(); return }

    const orderId = 'ZF-' + Date.now().toString().slice(-6)
    const orderData = {
      orderId,
      chatId: user?.id || null,
      items: cartItems.map(i => ({ name: i.product.name.uz, qty: i.qty, price: i.product.price })),
      total, address, recipientName: name, phone, date, time, payment, greeting, notes, lang,
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
        <button className="btn-checkout" onClick={submit}>✓ {t('checkout.confirm')}</button>
      </div>
      <div className="spacer-16" />
    </div>
  )
}
