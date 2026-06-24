import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES } from '../data/products'
import { supabase } from '../utils/supabase'

const ProductContext = createContext(null)
const LOCAL_KEY = 'zf_products'

function loadLocal() {
  try {
    const stored = localStorage.getItem(LOCAL_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return DEFAULT_PRODUCTS
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(loadLocal)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!supabase) { setLoaded(true); return }
    supabase.from('products').select('data').eq('id', 1).single()
      .then(({ data, error }) => {
        if (!error && data && data.data) {
          setProducts(data.data)
          localStorage.setItem(LOCAL_KEY, JSON.stringify(data.data))
        }
        setLoaded(true)
      })
  }, [])

  const persist = useCallback((updated) => {
    setProducts(updated)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated))
    if (supabase) {
      supabase.from('products').upsert({ id: 1, data: updated }).then()
    }
  }, [])

  const addProduct = useCallback((product) => {
    const newId = Math.max(0, ...products.map(p => p.id)) + 1
    const newProduct = { ...product, id: newId }
    const updated = [...products, newProduct]
    persist(updated)
    return newProduct
  }, [products, persist])

  const updateProduct = useCallback((id, data) => {
    const updated = products.map(p => p.id === id ? { ...p, ...data, id } : p)
    persist(updated)
  }, [products, persist])

  const deleteProduct = useCallback((id) => {
    const updated = products.filter(p => p.id !== id)
    persist(updated)
  }, [products, persist])

  const getProductById = useCallback((id) => products.find(p => p.id === Number(id)), [products])
  const getProductsByCategory = useCallback((cat) => cat === 'all' ? products : products.filter(p => p.category === cat), [products])
  const getFeatured = useCallback(() => products.filter(p => p.featured), [products])
  const getBestSellers = useCallback(() => products.filter(p => p.bestseller), [products])
  const getNewArrivals = useCallback(() => products.filter(p => p.newArrival), [products])
  const getSeasonal = useCallback(() => products.filter(p => p.seasonal), [products])
  const searchProducts = useCallback((query) => {
    const q = query.toLowerCase()
    return products.filter(p =>
      Object.values(p.name).some(n => n.toLowerCase().includes(q)) ||
      Object.values(p.desc).some(d => d.toLowerCase().includes(q)) ||
      p.composition.some(c => c.toLowerCase().includes(q))
    )
  }, [products])

  return (
    <ProductContext.Provider value={{
      products, loaded, addProduct, updateProduct, deleteProduct,
      getProductById, getProductsByCategory,
      getFeatured, getBestSellers, getNewArrivals, getSeasonal, searchProducts,
      categories: CATEGORIES,
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => useContext(ProductContext)
