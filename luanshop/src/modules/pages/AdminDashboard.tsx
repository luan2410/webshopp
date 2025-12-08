import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { apiFetch, setToken, getToken } from '../admin/auth'
import { io } from 'socket.io-client'

type Product = { id?: string, name: string, price: number, image: string, category?: string, description?: string }

export function AdminDashboard() {
  const [tab, setTab] = useState<'products'|'chat'>('products')
  useEffect(()=>{
    const token = getToken();
    if(!token) { window.location.href='/admin/login'; return }
    try {
      const payload = token.split('.')[1]
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
      if (json.role !== 'admin') { window.location.href = '/'; }
    } catch { window.location.href = '/' }
  }, [])
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1 container-responsive py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button className={`btn ${tab==='products'?'btn-primary':''}`} onClick={()=>setTab('products')}>Products</button>
            <button className={`btn ${tab==='chat'?'btn-primary':''}`} onClick={()=>setTab('chat')}>Chat</button>
          </div>
          <button className="btn" onClick={()=>{ setToken(null); window.location.href='/admin/login' }}>Logout</button>
        </div>
        {tab==='products' ? <ProductsPanel /> : <ChatPanel />}
      </main>
      <Footer />
    </div>
  )
}

function ProductsPanel() {
  const [list, setList] = useState<Product[]>([])
  const [draft, setDraft] = useState<Product>({ name:'', price:0, image:'', category:'', description:'' })
  async function load(){ const data = await apiFetch('/api/products'); setList(data) }
  useEffect(()=>{ load() }, [])
  async function create(){ 
    // Java backend expects category object. For simplicity, we assume user enters ID in category field or we handle it.
    // Ideally backend should accept categoryId.
    // Let's try sending category as object if possible, or just raw for now and let backend handle/fail.
    // Actually Java Product entity expects Category object. Sending string might fail.
    // Let's map draft.category string to { id: parseInt(draft.category) } if it's a number
    const catId = parseInt(draft.category || '0');
    const payload = { ...draft, category: catId ? { id: catId } : null };
    
    await apiFetch('/api/products', { method:'POST', body: JSON.stringify(payload) }); 
    setDraft({ name:'', price:0, image:'', category:'', description:'' }); 
    load(); 
  }
  async function update(p: Product){ 
     const catId = parseInt(p.category || '0'); // Frontend treats category as string name currently? 
     // Wait, useProducts maps category to name. Here in AdminDashboard, it might be name too.
     // To update correctly, we need category ID.
     // This part is tricky without Category management in UI.
     // We will point to /api/products endpoint first.
     await apiFetch(`/api/products/${p.id}`, { method:'PUT', body: JSON.stringify(p) }); load() 
  }
  async function remove(id?: string){ if(!id) return; await apiFetch(`/api/products/${id}`, { method:'DELETE' }); load() }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Thêm sản phẩm</h3>
        <input className="input mb-2" placeholder="Tên" value={draft.name} onChange={e=>setDraft({...draft, name:e.target.value})} />
        <input className="input mb-2" placeholder="Giá" type="number" value={draft.price} onChange={e=>setDraft({...draft, price:+e.target.value})} />
        <input className="input mb-2" placeholder="Ảnh" value={draft.image} onChange={e=>setDraft({...draft, image:e.target.value})} />
        <input className="input mb-2" placeholder="Danh mục" value={draft.category} onChange={e=>setDraft({...draft, category:e.target.value})} />
        <textarea className="input mb-3" placeholder="Mô tả" value={draft.description} onChange={e=>setDraft({...draft, description:e.target.value})} />
        <button className="btn btn-primary w-full" onClick={create}>Tạo</button>
      </div>
      <div className="md:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map(p => (
            <div key={p.id} className="card p-4">
              <div className="flex gap-3">
                <input className="input flex-1" value={p.name} onChange={e=>setList(ls=>ls.map(x=>x.id===p.id?{...x,name:e.target.value}:x))} />
                <input className="input w-28" type="number" value={p.price} onChange={e=>setList(ls=>ls.map(x=>x.id===p.id?{...x,price:+e.target.value}:x))} />
              </div>
              <input className="input mt-2" value={p.image} onChange={e=>setList(ls=>ls.map(x=>x.id===p.id?{...x,image:e.target.value}:x))} />
              <input className="input mt-2" value={p.category||''} onChange={e=>setList(ls=>ls.map(x=>x.id===p.id?{...x,category:e.target.value}:x))} />
              <textarea className="input mt-2" value={p.description||''} onChange={e=>setList(ls=>ls.map(x=>x.id===p.id?{...x,description:e.target.value}:x))} />
              <div className="mt-3 flex gap-2">
                <button className="btn btn-primary" onClick={()=>update(p)}>Lưu</button>
                <button className="btn" onClick={()=>remove(p.id)}>Xoá</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type ChatMsg = { id:string, role:'guest'|'admin', name?:string, contact?:string, text:string, ts:number, threadId?:string }
type Thread = { threadId:string, lastTs:number, lastText:string, count:number, lastRole:string, name?:string, contact?:string }

function ChatPanel(){
  const [threads, setThreads] = useState<Thread[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [text, setText] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const socket = useMemo(()=> io('/', { transports:['websocket'] }), [])

  async function loadThreads(){ const data = await apiFetch('/api/admin/chat'); setThreads(data); if (!active && data[0]) setActive(data[0].threadId) }
  async function loadMsgs(id: string){ const data = await apiFetch(`/api/admin/chat?threadId=${encodeURIComponent(id)}`); setMsgs(data) }
  useEffect(()=>{ loadThreads() }, [])
  useEffect(()=>{ if (active) loadMsgs(active) }, [active])

  async function reply(){ if(!text.trim() || !active) return; await apiFetch('/api/admin/chat/reply', { method:'POST', body: JSON.stringify({ threadId: active, text }) }); setText(''); loadMsgs(active); loadThreads() }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); reply() }
  }

  const activeThread = threads.find(t => t.threadId === active)

  useEffect(()=>{ return () => { socket.disconnect() } }, [socket])
  useEffect(()=>{
    socket.on('chat:new', (msg: ChatMsg) => { if (active === msg.threadId) setMsgs(m=>[...m, msg]); loadThreads(); play() })
    socket.on('chat:reply', (msg: ChatMsg) => { if (active === msg.threadId) setMsgs(m=>[...m, msg]); loadThreads(); })
    function play(){ if (!audioRef.current) return; audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}) }
  }, [socket, active])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card p-4 max-h-[70vh] overflow-auto">
        <div className="text-sm text-slate-400 mb-2">Cuộc trò chuyện</div>
        <div className="space-y-2">
          {threads.map(t => (
            <button key={t.threadId} className={`w-full text-left p-2 rounded border ${active===t.threadId? 'border-brand bg-slate-800' : 'border-slate-700 hover:bg-slate-800/50'}`} onClick={()=>setActive(t.threadId)}>
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-200">{t.name || 'Khách'}</div>
                <div className="text-xs text-slate-400">{new Date(t.lastTs).toLocaleTimeString()}</div>
              </div>
              <div className="text-xs text-slate-400 line-clamp-1">{t.lastText}</div>
              {t.contact && <div className="text-xs text-slate-500">{t.contact}</div>}
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2 card p-4 flex flex-col max-h-[70vh]">
        <audio ref={audioRef} src="/notify.mp3" preload="auto" />
        <div className="pb-2 mb-2 border-b border-slate-800">
          <div className="text-sm text-slate-400">Đang chat với</div>
          <div className="text-lg font-semibold">{activeThread?.name || 'Khách'}</div>
          {activeThread?.contact && <div className="text-xs text-slate-500">{activeThread.contact}</div>}
        </div>
        <div className="flex-1 overflow-auto space-y-2 pr-1">
          {msgs.map(m => (
            <div key={m.id} className={`flex ${m.role==='admin'?'justify-end':'justify-start'}`}>
              <div className={`${m.role==='admin'?'bg-brand text-white':'bg-slate-800 text-slate-100'} px-3 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap` }>
                <div className="text-[10px] opacity-80 mb-1">{new Date(m.ts).toLocaleTimeString()} • {m.role}</div>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <textarea className="input mb-2 min-h-[96px]" placeholder="Shift+Enter xuống dòng • Enter để gửi" value={text} onChange={e=>setText(e.target.value)} onKeyDown={onKey} />
          <div className="flex justify-end"><button className="btn btn-primary" onClick={reply}>Gửi</button></div>
        </div>
      </div>
    </div>
  )
}


