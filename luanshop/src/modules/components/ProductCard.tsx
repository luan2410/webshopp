import { Product } from "../data/useProducts"
import { Link } from 'react-router-dom'

export function formatPrice(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
}

export function ProductCard({ product }: { product: Product }) {
  const monthlyPrice = Math.round(product.price * 0.25)
  const crossedPrice = Math.round(monthlyPrice * 1.4)
  return (
    <Link to={`/product/${product.id}`} className="card block h-full flex flex-col min-h-[520px]">
      <div className="bg-transparent">
        <div className="relative w-full p-2 bg-slate-950 pb-[100%]">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-contain"
            loading="lazy"
            decoding="async"
            width={600}
            height={600}
            srcSet={`${product.image} 1x`}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x600.png?text=Image' }}
          />
        </div>
      </div>
      <div className="p-4 flex flex-col h-full">
        <div className="text-xs text-slate-400 mb-1">{product.category || 'Dịch vụ'}</div>
        <h3 className="font-medium text-slate-200 line-clamp-3 min-h-[4.5rem]">{product.name}</h3>
        {product.description && (
          <p className="mt-2 text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">{product.description}</p>
        )}
        <div className="mt-auto">
          <div className="text-xs text-slate-400 mb-1">Giá 1 tháng</div>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-400 line-through text-sm">{formatPrice(crossedPrice)}</span>
            <span className="text-brand text-lg font-semibold">{formatPrice(monthlyPrice)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}


