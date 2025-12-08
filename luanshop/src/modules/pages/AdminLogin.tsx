import { useState } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { setToken, apiFetch } from '../admin/auth'
import { useNavigate } from 'react-router-dom'

export function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  function parseRole(token: string): 'admin' | 'user' | undefined {
    try {
      const payload = token.split('.')[1]
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
      return json.role
    } catch { return undefined }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
      setToken(res.token)
      const role = parseRole(res.token)
      if (role?.toLowerCase() === 'admin') { nav('/admin') } else { nav('/') }
    } catch {
      try {
        const res = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) })
        setToken(res.token)
        const role = parseRole(res.token)
        if (role?.toLowerCase() === 'admin') { nav('/admin') } else { nav('/') }
      } catch (e) {
        setError('Đăng nhập/đăng ký thất bại')
      }
    }
  }

  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1 container-responsive py-8">
        <form onSubmit={submit} className="card max-w-sm w-[92vw] mx-auto p-6">
          <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
          {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
          <input className="input mb-3" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input className="input mb-4" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn btn-primary w-full" type="submit">Đăng nhập</button>
        </form>
      </main>
      <Footer />
    </div>
  )
}


