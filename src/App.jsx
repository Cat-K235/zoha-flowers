import React, { useState } from 'react'
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { I18nProvider } from './contexts/I18nContext'
import { CartProvider } from './contexts/CartContext'
import { TelegramProvider } from './contexts/TelegramContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProductProvider } from './contexts/ProductContext'
import SplashScreen from './components/SplashScreen'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import ToastContainer from './components/ToastContainer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Account from './pages/Account'
import Favorites from './pages/Favorites'
import Builder from './pages/Builder'
import Search from './pages/Search'
import Orders from './pages/Orders'
import Admin from './pages/Admin'
import Contacts from './pages/Contacts'
import Addresses from './pages/Addresses'

const HIDE_NAV = ['/checkout', '/search', '/order-success']

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const showNav = !HIDE_NAV.includes(location.pathname)

  return (
    <div id="app">
      <Header onSearch={() => navigate('/search')} />
      <main className="app-main">
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/catalog"       element={<Catalog />} />
          <Route path="/product/:id"   element={<Product />} />
          <Route path="/cart"          element={<Cart />} />
          <Route path="/checkout"      element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/account"       element={<Account />} />
          <Route path="/favorites"     element={<Favorites />} />
          <Route path="/builder"       element={<Builder />} />
          <Route path="/search"        element={<Search />} />
          <Route path="/orders"        element={<Orders />} />
          <Route path="/admin"         element={<Admin />} />
          <Route path="/contacts"      element={<Contacts />} />
          <Route path="/addresses"     element={<Addresses />} />
        </Routes>
      </main>
      {showNav && <BottomNav />}
      <ToastContainer />
    </div>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <I18nProvider>
      <TelegramProvider>
        <ProductProvider>
          <CartProvider>
            <ToastProvider>
              <HashRouter>
                {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
                <AppShell />
              </HashRouter>
            </ToastProvider>
          </CartProvider>
        </ProductProvider>
      </TelegramProvider>
    </I18nProvider>
  )
}
