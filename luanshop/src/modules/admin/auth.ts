export function getToken(): string | null {
  try { return localStorage.getItem('ltl_token') } catch { return null }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem('ltl_token', token)
    else localStorage.removeItem('ltl_token')
  } catch {}
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(options.headers as any) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(path, { ...options, headers })
  if (!res.ok) throw new Error(await res.text())
  return res.json().catch(()=>null)
}


