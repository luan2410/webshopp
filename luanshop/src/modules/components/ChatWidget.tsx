import { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const socket = useMemo(()=> io('/', { transports:['websocket'] }), [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ltl_chat_thread')
      if (saved) setThreadId(saved)
    } catch {}
  }, [])
  useEffect(() => {
    return () => { socket.disconnect() }
  }, [socket])

  const [messages, setMessages] = useState<Array<{ id:string, role:'guest'|'admin', text:string, ts:number, threadId?:string }>>([])
  const boxRef = useRef<HTMLDivElement | null>(null)

  function scrollToBottom(){
    const el = boxRef.current; if (!el) return; setTimeout(()=>{ el.scrollTop = el.scrollHeight }, 0)
  }

  useEffect(() => {
    socket.on('chat:reply', (msg: any) => {
      if (msg?.threadId && msg.threadId === threadId) {
        setMessages((m)=>[...m, msg])
        if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}) }
        scrollToBottom()
      }
    })
  }, [socket, threadId])

  useEffect(() => {
    if (!threadId || !open) return
    ;(async () => {
      try {
        const res = await fetch(`/api/chat?threadId=${encodeURIComponent(threadId)}`)
        if (res.ok) { const data = await res.json(); setMessages(data) }
        scrollToBottom()
      } catch {}
    })()
  }, [threadId, open])

  async function send() {
    if (!text.trim()) return
    setSending(true)
    try {
      const tid = threadId || String(Date.now())
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, name, contact, threadId: tid })
      })
      setThreadId(tid)
      try { localStorage.setItem('ltl_chat_thread', tid) } catch {}
      setMessages(m=>[...m, { id: String(Date.now()), role: 'guest', text, ts: Date.now(), threadId: tid }])
      setSent(true)
      setText('')
      scrollToBottom()
    } finally { setSending(false) }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button className="btn btn-primary rounded-full h-12 w-12" onClick={()=>setOpen(true)}>Chat</button>
      )}
      {open && (
        <div className="card w-[88vw] max-w-sm p-4">
          <audio ref={audioRef} src="/notify.mp3" preload="auto" />
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Hỗ trợ nhanh</div>
            <button className="btn" onClick={()=>setOpen(false)}>Đóng</button>
          </div>
          <div ref={boxRef} className="mb-3 max-h-[40vh] overflow-auto space-y-2 pr-1">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role==='admin'?'justify-start':'justify-end'}`}>
                <div className={`${m.role==='admin'?'bg-slate-800 text-slate-100':'bg-brand text-white'} px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap`}>
                  <div className="text-[10px] opacity-80 mb-1">{new Date(m.ts).toLocaleTimeString()} • {m.role}</div>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <input className="input mb-2" placeholder="Tên (tuỳ chọn)" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input mb-2" placeholder="Liên hệ (Zalo/Email - tuỳ chọn)" value={contact} onChange={e=>setContact(e.target.value)} />
          <textarea className="input mb-2 min-h-[100px]" placeholder="Nội dung cần hỗ trợ" value={text} onChange={e=>setText(e.target.value)} />
          <div className="flex justify-between items-center">
            {sent ? <div className="text-xs text-green-400">Đã gửi! Admin sẽ phản hồi sớm.</div> : <div className="text-xs text-slate-400">Không cần đăng nhập</div>}
            <button className="btn btn-primary" disabled={sending} onClick={send}>{sending? 'Đang gửi...' : 'Gửi'}</button>
          </div>
        </div>
      )}
    </div>
  )
}


