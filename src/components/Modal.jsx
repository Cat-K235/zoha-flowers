import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.target === e.currentTarget) onClose() }
    return () => {}
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content">
        <div className="modal-handle" />
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>,
    document.body
  )
}
