import { useMemo, useState } from 'react'
import { Product, useProducts } from './data/useProducts'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ProductCard } from './components/ProductCard'
import { AdminPanel } from './components/admin/AdminPanel'
import { ChatWidget } from './components/ChatWidget'

type SortOrder = 'asc' | 'desc' | 'none'

export function App() {
  const { products, loading, error } = useProducts()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOrder>('none')

  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach(p => p.category && set.add(p.category))
    return ['Tất cả', ...Array.from(set)]
  }, [products])

  const [activeCategory, setActiveCategory] = useState<string>('Tất cả')

  const filtered = useMemo(() => {
    let list = products
    if (activeCategory !== 'Tất cả') {
      list = list.filter(p => p.category === activeCategory)
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    if (sort !== 'none') {
      list = [...list].sort((a, b) => sort === 'asc' ? a.price - b.price : b.price - a.price)
    }
    return list
  }, [products, query, sort, activeCategory])

  const [visible, setVisible] = useState<number>(8)
  const toShow = filtered.slice(0, visible)

  return (
    <div className="min-h-full flex flex-col">
      <Header />

      <main className="flex-1 container-responsive py-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <section className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex items-stretch gap-2 flex-wrap">
            <input
              placeholder="Tìm kiếm sản phẩm, ví dụ: Windows 11, Office 2021..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input flex-1 min-w-[180px]"
              aria-label="Tìm kiếm sản phẩm"
            />
            <div className="flex gap-2 w-full xs:w-auto">
              <button className={`btn w-full xs:w-auto ${sort==='asc'?'btn-primary':''}`} onClick={() => setSort(sort==='asc'?'none':'asc')}>Giá ↑</button>
              <button className={`btn w-full xs:w-auto ${sort==='desc'?'btn-primary':''}`} onClick={() => setSort(sort==='desc'?'none':'desc')}>Giá ↓</button>
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(c => (
            <button key={c} className={`btn ${activeCategory===c?'btn-primary':''}`} onClick={()=>setActiveCategory(c)}>{c}</button>
          ))}
          {activeCategory !== 'Tất cả' && (
            <button className="btn" onClick={()=>setActiveCategory('Tất cả')}>Hiện đầy đủ</button>
          )}
        </div>


        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card">
                <div className="bg-white">
                  <div className="relative w-full" style={{ aspectRatio: '4 / 5' }}>
                    <div className="absolute inset-0 skeleton" />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-5 w-2/3 skeleton rounded" />
                  <div className="h-4 w-1/3 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-600">Không thể tải dữ liệu. Vui lòng thử lại.</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch content-start">
            {toShow.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length > visible && (
          <div className="mt-8 flex justify-center">
            <button className="btn btn-primary" onClick={()=>setVisible(v=>v+8)}>Xem thêm</button>
          </div>
        )}
      </main>

      <Footer />
      
      {/* <AdminPanel /> */}
      <ChatWidget />
    </div>
  )
}


