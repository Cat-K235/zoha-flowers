const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || ''

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
}

export async function uploadPaymentScreenshot(file, orderId) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${orderId}-${Date.now()}.${ext}`
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/payments/${path}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': file.type,
      },
      body: file,
    })
    if (!res.ok) return null
    return `${SUPABASE_URL}/storage/v1/object/public/payments/${path}`
  } catch { return null }
}

export const db = (SUPABASE_URL && SUPABASE_KEY) ? {
  async loadProducts() {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/products?id=eq.1&select=data', { headers })
      if (!res.ok) return null
      const rows = await res.json()
      return (rows[0] && rows[0].data) || null
    } catch { return null }
  },
  async saveProducts(products) {
    try {
      await fetch(SUPABASE_URL + '/rest/v1/products?id=eq.1', {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ data: products }),
      })
    } catch {}
  },
} : null
