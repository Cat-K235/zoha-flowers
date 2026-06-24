import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { useTelegram } from '../contexts/TelegramContext'
import { useProducts } from '../contexts/ProductContext'
import { useToast } from '../contexts/ToastContext'
import { CATEGORIES } from '../data/products'
import { haptic } from '../utils/telegram'

const EMPTY_PRODUCT = {
  name: { uz: '', ru: '', en: '' },
  desc: { uz: '', ru: '', en: '' },
  price: '',
  oldPrice: '',
  category: 'bouquets',
  emoji: '🌸',
  image: null,
  badge: '',
  rating: 4.5,
  reviews: 0,
  composition: [],
  featured: false,
  bestseller: false,
  newArrival: false,
  seasonal: false,
}

const S = {
  label: { display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#c9a96e', marginBottom: 8 },
  tag: { width: 30, height: 30, borderRadius: 6, background: '#c9a96e', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 },
  input: { flex: 1, padding: '12px 14px', border: '1.5px solid #ecddd0', borderRadius: 8, fontSize: 14, background: '#fff', color: '#3a2e2e', outline: 'none' },
  textarea: { flex: 1, padding: '12px 14px', border: '1.5px solid #ecddd0', borderRadius: 8, fontSize: 14, background: '#fff', color: '#3a2e2e', outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'inherit' },
}

const EMOJI_OPTIONS = ['🌹', '🌸', '🌷', '🌻', '🌺', '🌼', '💐', '🪻', '🤍', '💜', '🏵️', '🌿', '🎁', '💍']

export default function Admin() {
  const { t, lang, formatPrice } = useI18n()
  const { isAdmin } = useTelegram()
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [view, setView] = useState('dashboard')
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState(EMPTY_PRODUCT)
  const [compositionInput, setCompositionInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      const product = products.find(p => p.id === Number(editId))
      if (product) {
        setEditingProduct(product)
        setFormData({
          ...product,
          price: String(product.price),
          oldPrice: product.oldPrice ? String(product.oldPrice) : '',
          badge: product.badge || '',
        })
        setCompositionInput(product.composition.join(', '))
        setView('form')
      }
      setSearchParams({}, { replace: true })
    }
  }, [searchParams])

  const orders = JSON.parse(localStorage.getItem('zf_orders') || '[]')
  const todayTotal = orders.filter(o => o.date === new Date().toISOString().split('T')[0]).reduce((s, o) => s + o.total, 0)

  if (!isAdmin) {
    return (
      <div className="page page-top-pad" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>Access denied</div>
      </div>
    )
  }

  const openAddForm = () => {
    setEditingProduct(null)
    setFormData(EMPTY_PRODUCT)
    setCompositionInput('')
    setView('form')
  }

  const openEditForm = (product) => {
    setEditingProduct(product)
    setFormData({
      ...product,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : '',
      badge: product.badge || '',
    })
    setCompositionInput(product.composition.join(', '))
    setView('form')
  }

  const handleSave = () => {
    if (!formData.name.uz.trim()) {
      showToast('Iltimos, gul nomini kiriting', 'error')
      return
    }
    if (!formData.price || Number(formData.price) <= 0) {
      showToast('Iltimos, narxni kiriting', 'error')
      return
    }

    const data = {
      ...formData,
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
      badge: formData.badge || null,
      composition: compositionInput.split(',').map(s => s.trim()).filter(Boolean),
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, data)
      showToast('Mahsulot yangilandi ✓', 'success')
    } else {
      addProduct(data)
      showToast('Yangi mahsulot qo\'shildi ✓', 'success')
    }
    haptic.success?.()
    setView('products')
  }

  const handleDelete = (id) => {
    deleteProduct(id)
    setDeleteConfirm(null)
    showToast('Mahsulot o\'chirildi', 'success')
    haptic.success?.()
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateName = (langKey, value) => {
    setFormData(prev => ({ ...prev, name: { ...prev.name, [langKey]: value } }))
  }

  const updateDesc = (langKey, value) => {
    setFormData(prev => ({ ...prev, desc: { ...prev.desc, [langKey]: value } }))
  }

  // Dashboard view
  if (view === 'dashboard') {
    const quickActions = [
      { icon: '📦', label: t('admin.products'), count: `${products.length}`, action: () => setView('products') },
      { icon: '🗂️', label: t('admin.categories'), count: `${CATEGORIES.length - 1}` },
      { icon: '📋', label: t('admin.orders'), count: `${orders.length}` },
      { icon: '⭐', label: t('admin.reviews'), count: '5' },
      { icon: '📊', label: t('admin.analytics'), count: '' },
      { icon: '🎁', label: t('admin.promo'), count: '3' },
    ]

    return (
      <div className="page page-top-pad">
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-value">{orders.filter(o => o.date === new Date().toISOString().split('T')[0]).length}</div>
            <div className="stat-label">{t('admin.stats.today')}</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{todayTotal > 0 ? formatPrice(todayTotal) : '0'}</div>
            <div className="stat-label">{t('admin.stats.month')}</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">{t('admin.stats.total')}</div>
          </div>
        </div>

        <div className="admin-grid">
          {quickActions.map((a, i) => (
            <div key={i} className="admin-card press-scale" onClick={a.action}>
              <div className="admin-card-icon">{a.icon}</div>
              <div className="admin-card-label">{a.label}</div>
              {a.count && <div className="admin-card-count">{a.count}</div>}
            </div>
          ))}
        </div>

        {orders.length > 0 && (
          <>
            <div style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--color-text-mid)' }}>
              {t('admin.orders')}
            </div>
            <div className="orders-list" style={{ paddingTop: 0 }}>
              {orders.slice(0, 5).map((o, i) => (
                <div key={i} className="order-card">
                  <div className="order-card-header">
                    <span className="order-id">{o.orderId}</span>
                    <span className="order-date">{o.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text-mid)' }}>
                      {o.recipientName} • {o.phone}
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-rose-dark)', fontWeight: 600 }}>
                      {formatPrice(o.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="spacer-16" />
      </div>
    )
  }

  // Products list view
  if (view === 'products') {
    return (
      <div className="page page-top-pad">
        <div className="admin-topbar">
          <button className="admin-back-btn" onClick={() => setView('dashboard')}>←</button>
          <h2 className="admin-page-title">{t('admin.products')}</h2>
          <button className="admin-add-btn" onClick={openAddForm}>+</button>
        </div>

        <div className="admin-product-list">
          {products.map(product => (
            <div key={product.id} className="admin-product-item">
              <div className="admin-product-emoji">
                {product.image ? <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} /> : product.emoji}
              </div>
              <div className="admin-product-info">
                <div className="admin-product-name">{product.name[lang] || product.name.uz}</div>
                <div className="admin-product-price">{formatPrice(product.price)}</div>
              </div>
              <div className="admin-product-actions">
                <button className="admin-action-btn edit" onClick={() => openEditForm(product)}>✏️</button>
                <button className="admin-action-btn delete" onClick={() => setDeleteConfirm(product.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {deleteConfirm && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null) }}>
            <div className="modal-content" style={{ maxHeight: 'auto', padding: '24px' }}>
              <div className="modal-handle" />
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 8 }}>O'chirishni tasdiqlang</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-mid)', marginBottom: 20 }}>
                  Bu mahsulotni o'chirib bo'lmaydi. Davom etasizmi?
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="admin-form-btn secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>
                    Bekor qilish
                  </button>
                  <button className="admin-form-btn danger" onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1 }}>
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 500000) {
      showToast('Rasm 500KB dan kichik bo\'lishi kerak', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => updateField('image', ev.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => updateField('image', null)

  // Add/Edit form view
  if (view === 'form') {
    return (
      <div className="page page-top-pad" style={{ background: '#fdf8f3' }}>
        <div className="admin-topbar">
          <button className="admin-back-btn" onClick={() => setView('products')}>←</button>
          <h2 className="admin-page-title" style={{ color: '#3a2e2e' }}>
            {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
          </h2>
          <div style={{ width: 36 }} />
        </div>

        <div className="admin-form">
          {/* Image upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Rasm</label>
            {formData.image ? (
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <img src={formData.image} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 14, border: '2px solid #ecddd0' }} />
                <button onClick={removeImage} style={{ position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: '50%', border: 'none', background: '#e07070', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 120, height: 120, borderRadius: 14, border: '2px dashed #ecddd0', background: '#fff', cursor: 'pointer', color: '#b3a59e', fontSize: 13 }}>
                <span style={{ fontSize: 28, marginBottom: 4 }}>📷</span>
                <span>Yuklash</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Emoji fallback */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Emoji (rasm bo'lmasa)</label>
            <div className="admin-emoji-picker">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  className={`admin-emoji-option${formData.emoji === e ? ' active' : ''}`}
                  onClick={() => updateField('emoji', e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Names */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Nomi</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={S.tag}>UZ</span>
                <input type="text" style={S.input} placeholder="O'zbekcha nomi" value={formData.name.uz} onChange={e => updateName('uz', e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={S.tag}>RU</span>
                <input type="text" style={S.input} placeholder="Русское название" value={formData.name.ru} onChange={e => updateName('ru', e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={S.tag}>EN</span>
                <input type="text" style={S.input} placeholder="English name" value={formData.name.en} onChange={e => updateName('en', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Tavsifi</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ ...S.tag, marginTop: 10 }}>UZ</span>
                <textarea style={S.textarea} placeholder="O'zbekcha tavsif" value={formData.desc.uz} onChange={e => updateDesc('uz', e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ ...S.tag, marginTop: 10 }}>RU</span>
                <textarea style={S.textarea} placeholder="Описание на русском" value={formData.desc.ru} onChange={e => updateDesc('ru', e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ ...S.tag, marginTop: 10 }}>EN</span>
                <textarea style={S.textarea} placeholder="English description" value={formData.desc.en} onChange={e => updateDesc('en', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Price */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Narxi</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="number" style={S.input} placeholder="Narx (so'm)" value={formData.price} onChange={e => updateField('price', e.target.value)} />
              <input type="number" style={S.input} placeholder="Eski narx (ixtiyoriy)" value={formData.oldPrice} onChange={e => updateField('oldPrice', e.target.value)} />
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Kategoriya</label>
            <select className="admin-select" style={{ color: '#3a2e2e', background: '#fff' }} value={formData.category} onChange={e => updateField('category', e.target.value)}>
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Badge */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Badge</label>
            <div className="admin-badge-picker">
              {['', 'new', 'sale'].map(b => (
                <button key={b} className={`admin-badge-option${formData.badge === b ? ' active' : ''}`} onClick={() => updateField('badge', b)}>
                  {b === '' ? 'Yo\'q' : b === 'new' ? 'NEW' : 'SALE'}
                </button>
              ))}
            </div>
          </div>

          {/* Composition */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Tarkibi (vergul bilan)</label>
            <textarea style={S.textarea} placeholder="Masalan: Atirgul ×25, Gipsofila, Yashil barglar" value={compositionInput} onChange={e => setCompositionInput(e.target.value)} />
          </div>

          {/* Flags */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Belgilar</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'featured', label: 'Tanlangan' },
                { key: 'bestseller', label: 'Bestseller' },
                { key: 'newArrival', label: 'Yangi' },
                { key: 'seasonal', label: 'Mavsumiy' },
              ].map(flag => (
                <label key={flag.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: formData[flag.key] ? '#f5d5d5' : '#fff', borderRadius: 8, border: formData[flag.key] ? '1.5px solid #e8a4a4' : '1.5px solid #ecddd0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData[flag.key]} onChange={e => updateField(flag.key, e.target.checked)} style={{ accentColor: '#d4726f' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#3a2e2e' }}>{flag.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="admin-form-actions">
            <button className="admin-form-btn secondary" onClick={() => setView('products')}>
              Bekor qilish
            </button>
            <button className="admin-form-btn primary" onClick={handleSave}>
              {editingProduct ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
