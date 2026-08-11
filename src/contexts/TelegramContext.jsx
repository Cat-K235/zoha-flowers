import React, { createContext, useContext, useEffect, useState } from 'react'
import { initTelegram, getTelegramUser, checkIsAdmin, onInitDataChanged } from '../utils/telegram'

const TelegramContext = createContext(null)

export function TelegramProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    initTelegram()
    const syncUser = () => {
      const u = getTelegramUser()
      setUser(u)
      setIsAdmin(u ? checkIsAdmin(u.id) : false)
    }
    syncUser()
    const unsubscribe = onInitDataChanged(syncUser)
    return () => { if (typeof unsubscribe === 'function') unsubscribe() }
  }, [])

  return (
    <TelegramContext.Provider value={{ user, isAdmin }}>
      {children}
    </TelegramContext.Provider>
  )
}

export const useTelegram = () => useContext(TelegramContext)
