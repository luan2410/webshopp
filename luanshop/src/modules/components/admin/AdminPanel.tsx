import { useEffect, useMemo, useState } from 'react'
import { Product } from '../../data/useProducts'

// Hidden admin: open with keyboard shortcut Ctrl+Alt+A

type View = 'login' | 'editor' | 'hidden'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = '@LuanBH68'

export function AdminPanel() {
  const [view, setView] = useState<View>('hidden')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [raw, setRaw] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) {
        setView('login')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const parsed = useMemo(() => {
    try {
      const data = JSON.parse(raw)
      if (!Array.isArray(data)) return []
      return data as Product[]
    } catch {
      return []
    }
  }, [raw])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setView('editor')
      setError(null)
      fetch('/products.json').then(r => r.json()).then(d => setRaw(JSON.stringify(d, null, 2)))
    } else {
      setError('Sai tài khoản hoặc mật khẩu')
    }
  }

  if (view === 'hidden') return null

  if (view === 'login') {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
        <form onSubmit={handleLogin} className="card w-[90vw] max-w-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Admin Login</h3>
          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
          <input className="input mb-3" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input className="input mb-4" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn" onClick={()=>setView('hidden')}>Đóng</button>
            <button className="btn btn-primary" type="submit">Đăng nhập</button>
          </div>
        </form>
      </div>
    )
  }

  // Editor: allows editing JSON and downloading as file; no server writes
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="card w-[95vw] max-w-4xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Quản lý sản phẩm (offline)</h3>
          <div className="flex gap-2">
            <button className="btn" onClick={()=>setView('hidden')}>Ẩn</button>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-3">Chỉnh sửa JSON bên dưới và bấm Export để tải về file products.json. Sau đó thay thế file trong thư mục public khi triển khai. Không có ghi dữ liệu lên server.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <textarea className="input min-h-[320px] font-mono" value={raw} onChange={e=>setRaw(e.target.value)} />
            <div className="mt-3 flex gap-2">
              <button className="btn btn-primary" onClick={()=>download('products.json', raw)}>Export JSON</button>
              <button className="btn" onClick={()=>copy(raw)}>Copy</button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-slate-600">Preview:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {parsed.slice(0,6).map(p => (
                <div key={p.id} className="border rounded-lg p-2">
                  <div className="relative w-full mb-2" style={{aspectRatio:'4/5'}}>
                    <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover rounded" />
                  </div>
                  <div className="text-xs font-medium line-clamp-2 min-h-[2rem]">{p.name}</div>
                  <div className="text-xs text-brand font-semibold mt-1">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text) } catch {}
}


