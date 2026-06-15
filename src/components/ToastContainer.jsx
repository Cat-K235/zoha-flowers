import React from 'react'
import { createPortal } from 'react-dom'
import { useToast } from '../contexts/ToastContext'

export default function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return createPortal(
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast${t.type ? ` ${t.type}` : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>,
    document.body
  )
}
