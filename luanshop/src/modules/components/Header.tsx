import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getToken, setToken } from '../admin/auth'
function parseJwtUsername(token: string | null): { username?: string, role?: string } {
  if (!token) return {}
  try {
    const payload = token.split('.')[1]
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return { username: json.username, role: json.role }
  } catch { return {} }
}

export function Header() {
  const [auth, setAuth] = useState<{ username?: string, role?: string }>({})
  useEffect(() => { setAuth(parseJwtUsername(getToken())) }, [])

  return (
    <header className="border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
      <div className="container-responsive py-2 text-xs text-slate-400 flex items-center justify-end gap-3">
        <a href="tel:0794174833" className="hover:text-white">Zalo/Hotline: <span className="font-semibold text-white">0794174833</span></a>
        <a href="#" className="hover:text-white">Kiểm tra đơn hàng</a>
        {!auth.username ? (
          <Link to="/admin/login" className="hover:text-white">Đăng nhập</Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/admin" className="flex items-center gap-2 hover:text-white">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-brand text-white grid place-items-center font-semibold">
                {auth.username.slice(0,1).toUpperCase()}
              </div>
              <span className="hidden sm:inline">{auth.username}</span>
            </Link>
            <button className="btn" onClick={()=>{ setToken(null); setAuth({}) }}>Thoát</button>
          </div>
        )}
      </div>
      <div className="container-responsive py-4 flex items-center gap-4">
        <Link to="/" aria-label="Về trang chủ">
          <img src="/ltl-logo.svg" alt="LTL Shop" className="h-12 w-12 md:h-14 md:w-14 rounded-2xl shadow-lg shadow-brand/40 ring-1 ring-brand/40" />
        </Link>
        <div>
          <Link to="/" className="hover:text-white">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">LTL Shop • Dịch vụ bản quyền số</h1>
          </Link>
          <p className="text-xs text-slate-400 mt-1">Cung cấp key Windows, Office, Email, AI/Dev Tools uy tín • Hỗ trợ nhanh qua Zalo 0794174833</p>
        </div>
      </div>
    </header>
  )
}


