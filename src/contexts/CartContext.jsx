import React, { createContext, useContext, useState, useCallback } from 'react'

const STORAGE_KEY = 'zf_cart'
const FAV_KEY = 'zf_favorites'
const PROMO_CODES = { 'ZOHA10': 10, 'WELCOME': 15, 'SPRING24': 20 }

const CartContext = createContext(null)

export function CartProvider({ children, products }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem(FAV_KEY) || '[]'))
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [isFirstOrder] = useState(() => !localStorage.getItem('zf_ordered'))

  const add = useCallback((productId, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === productId)
      const next = existing
        ? prev.map(i => i.id === productId ? { ...i, qty: i.qty + qty } : i)
        : [...prev, { id: productId, qty }]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const remove = useCallback((productId) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== productId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const updateQty = useCallback((productId, qty) => {
    if (qty <= 0) { remove(productId); return }
    setItems(prev => {
      const next = prev.map(i => i.id === productId ? { ...i, qty } : i)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [remove])

  const clear = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '[]')
    setItems([])
  }, [])

  const getCartItems = useCallback(() =>
    items.map(i => {
      const product = products.find(p => p.id === i.id)
      return product ? { ...i, product } : null
    }).filter(Boolean),
  [items, products])

  const count = items.reduce((s, i) => s + i.qty, 0)

  const getSubtotal = useCallback(() =>
    getCartItems().reduce((s, i) => s + i.product.price * i.qty, 0),
  [getCartItems])

  const getDelivery = useCallback(() =>
    getSubtotal() >= 500000 ? 0 : 30000,
  [getSubtotal])

  const getDiscount = useCallback(() => {
    const sub = getSubtotal()
    const firstD = isFirstOrder ? sub * 0.10 : 0
    const promoD = appliedPromo ? sub * (PROMO_CODES[appliedPromo] / 100) : 0
    return Math.round(Math.max(firstD, promoD))
  }, [getSubtotal, isFirstOrder, appliedPromo])

  const getTotal = useCallback(() =>
    getSubtotal() + getDelivery() - getDiscount(),
  [getSubtotal, getDelivery, getDiscount])

  const applyPromo = useCallback((code) => {
    const upper = code.trim().toUpperCase()
    if (PROMO_CODES[upper]) { setAppliedPromo(upper); return { ok: true, percent: PROMO_CODES[upper] } }
    return { ok: false }
  }, [])

  const toggleFav = useCallback((productId) => {
    setFavorites(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
      localStorage.setItem(FAV_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFav = useCallback((productId) => favorites.includes(productId), [favorites])

  const getFavoriteProducts = useCallback(() =>
    favorites.map(id => products.find(p => p.id === id)).filter(Boolean),
  [favorites, products])

  const markOrdered = useCallback(() => {
    localStorage.setItem('zf_ordered', '1')
  }, [])

  return (
    <CartContext.Provider value={{
      items, count, add, remove, updateQty, clear,
      getCartItems, getSubtotal, getDelivery, getDiscount, getTotal,
      applyPromo, appliedPromo,
      toggleFav, isFav, getFavoriteProducts,
      markOrdered, isFirstOrder,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
