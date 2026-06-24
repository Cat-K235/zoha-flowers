import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/main.css'
import './styles/animations.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: { padding: 40, textAlign: 'center', fontFamily: 'system-ui' }
      },
        React.createElement('div', { style: { fontSize: 48, marginBottom: 16 } }, '🌸'),
        React.createElement('h2', { style: { marginBottom: 8 } }, 'Xatolik yuz berdi'),
        React.createElement('p', { style: { color: '#888' } }, 'Iltimos, ilovani qayta oching'),
        React.createElement('button', {
          onClick: function() { window.location.reload() },
          style: { marginTop: 16, padding: '10px 24px', borderRadius: 12, border: 'none', background: '#d4726f', color: '#fff', fontSize: 14, cursor: 'pointer' }
        }, 'Qayta yuklash')
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
