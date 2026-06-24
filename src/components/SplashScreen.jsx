import React, { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setHidden(true)
      setTimeout(onDone, 600)
    }, 1800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`splash${hidden ? ' hidden' : ''}`}>
      <div className="splash-logo">
        <img
          className="splash-img"
          src="./zoha-logo.svg"
          alt="Zoha Flowers"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
        />
        <span className="splash-icon" style={{ display: 'none' }}>🌸</span>
        <h1 className="splash-title">Zoha Flowers</h1>
        <p className="splash-subtitle">Premium Flower Boutique</p>
      </div>
    </div>
  )
}
