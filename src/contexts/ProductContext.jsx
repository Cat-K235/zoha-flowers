import React, { createContext, useContext, useState, useCallback } from 'react'
import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES } from '../data/products'

const ProductContext = createContext(null)

const STORAGE_KEY = 'zf_products'

function loadProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return DEFAULT_PRODUCTS
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(loadProducts)

  const addProduct = useCallback((product) => {
    const newId = Math.max(0, ...products.map(p => p.id)) + 1
    const newProduct = { ...product, id: newId }
    const updated = [...products, newProduct]
    setProducts(updated)
    saveProducts(updated)
    return newProduct
  }, [products])

  const updateProduct = useCallback((id, data) => {
    const updated = products.map(p => p.id === id ? { ...p, ...data, id } : p)
    setProducts(updated)
    saveProducts(updated)
  }, [products])

  const deleteProduct = useCallback((id) => {
    const updated = products.filter(p => p.id !== id)
    setProducts(updated)
    saveProducts(updated)
  }, [products])

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
      products, addProduct, updateProduct, deleteProduct,
      getProductById, getProductsByCategory,
      getFeatured, getBestSellers, getNewArrivals, getSeasonal, searchProducts,
      categories: CATEGORIES,
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => useContext(ProductContext)
