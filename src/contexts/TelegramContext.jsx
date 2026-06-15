import React, { createContext, useContext, useEffect, useState } from 'react'
import { initTelegram, getTelegramUser, checkIsAdmin } from '../utils/telegram'

const TelegramContext = createContext(null)

export function TelegramProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    initTelegram()
    const u = getTelegramUser()
    setUser(u)
    if (u) setIsAdmin(checkIsAdmin(u.id))
  }, [])

  return (
    <TelegramContext.Provider value={{ user, isAdmin }}>
      {children}
    </TelegramContext.Provider>
  )
}

export const useTelegram = () => useContext(TelegramContext)
