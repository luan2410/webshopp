import { useEffect, useState } from 'react'

export type Product = {
  id: string
  name: string
  price: number
  image: string
  category?: string
  description?: string
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const controller = new AbortController()
    setLoading(true)
    const apiUrl = '/api/products' // Use real backend API via Vite proxy
    const url = apiUrl
    fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('Network')
        const data = await r.json()
        if (!alive) return
        const normalized = (Array.isArray(data) ? data : []).map((p: any) => {
          // Map Java Backend response structure to Frontend Product type
          // Java returns category as object { id, name, description }
          const catName = p.category ? (typeof p.category === 'object' ? p.category.name : p.category) : '';
          
          return {
            id: String(p.id),
            name: String(p.name),
            price: Number(p.price) || 0,
            image: String(p.image || ''),
            category: catName || inferCategory(p.name || ''),
            description: String(p.description || ''),
          } as Product
        })
        setProducts(normalized)
      })
      .catch((e) => {
        if (!alive) return
        setError('failed')
        console.error(e)
      })
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
      controller.abort()
    }
  }, [])

  return { products, loading, error }
}

function inferCategory(name: string): string {
  if (/(windows|win\s?10|win\s?11|license|bản quyền)/i.test(name)) return 'Windows'
  if (/(office|word|excel|powerpoint|visio|project)/i.test(name)) return 'Microsoft Office'
  if (/(mail|email|gmail|outlook)/i.test(name)) return 'Email'
  if (/(vpn|proxy|server)/i.test(name)) return 'Hạ tầng'
  if (/(chatgpt|cursor|pro|ai)/i.test(name)) return 'AI/Dev Tools'
  if (/(adobe|autocad|autodesk|design)/i.test(name)) return 'Thiết kế'
  return 'Dịch vụ khác'
}


