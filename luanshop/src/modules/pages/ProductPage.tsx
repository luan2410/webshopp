import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProducts } from '../data/useProducts'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { formatPrice } from '../components/ProductCard'

type PlanKey = '1m' | '3m' | 'lifetime'

const DEFAULT_MULTIPLIER: Record<PlanKey, number> = {
  '1m': 0.25,
  '3m': 0.6,
  'lifetime': 1,
}

export function ProductPage() {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const product = useMemo(() => products.find(p => String(p.id) === String(id)), [products, id])
  const [plan, setPlan] = useState<PlanKey>('lifetime')
  const [showQR, setShowQR] = useState(false)

  const price = useMemo(() => {
    if (!product) return 0
    const base = product.price
    return Math.round(base * DEFAULT_MULTIPLIER[plan])
  }, [product, plan])

  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1 container-responsive py-8">
        {loading && <div className="text-slate-400">Đang tải...</div>}
        {!loading && !product && (
          <div className="text-slate-200">Không tìm thấy sản phẩm. <Link className="text-brand" to="/">Về trang chủ</Link></div>
        )}
        {product && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-4">
              <div className="relative w-full" style={{aspectRatio:'1/1'}}>
                <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" width={600} height={600} loading="lazy" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold">{product.name}</h1>
              {product.description && (
                <p className="text-sm text-slate-300">{product.description}</p>
              )}
              <div className="text-sm text-slate-400">Danh mục: {product.category || 'Dịch vụ'}</div>

              <div>
                <div className="mb-2 text-sm text-slate-400">Thời hạn</div>
                <div className="flex gap-2">
                  <button className={`btn ${plan==='1m'?'btn-primary':''}`} onClick={()=>setPlan('1m')}>1 tháng</button>
                  <button className={`btn ${plan==='3m'?'btn-primary':''}`} onClick={()=>setPlan('3m')}>3 tháng</button>
                  <button className={`btn ${plan==='lifetime'?'btn-primary':''}`} onClick={()=>setPlan('lifetime')}>Vĩnh viễn</button>
                </div>
              </div>

              <div className="text-3xl font-bold text-brand">{formatPrice(price)}</div>

              <div className="flex gap-3">
                <button className="btn btn-primary" onClick={()=>setShowQR(true)}>Mua ngay</button>
                <a href="tel:0794174833" className="btn">Gọi 0794174833</a>
              </div>

              <div className="text-sm text-slate-400 pt-4">
                Ghi chú: Giá có thể thay đổi theo thời hạn và chương trình khuyến mãi.
              </div>
            </div>
          </div>
        )}
      </main>
      {showQR && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
          <div className="card p-4 max-w-md w-[92vw]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Quét QR để thanh toán</h3>
              <button className="btn" onClick={()=>setShowQR(false)}>Đóng</button>
            </div>
            <img src="/pr.jpg" alt="QR thanh toán" className="w-full h-auto rounded" />
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}


