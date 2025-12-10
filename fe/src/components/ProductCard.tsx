import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function formatPrice(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
}

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Simulate the pricing display from luanshop (for visual consistency)
  // Assuming the price from backend is the "monthly" or actual price
  // We can create a fake "original" price for the crossed-out effect if desired
  // or just display the actual price nicely.
  // luanshop logic: monthlyPrice = price * 0.25 (if price was total? or maybe it's just a display trick)
  // Let's just stick to the actual price from BE as the main price.
  
  // If we want to mimic luanshop exactly:
  // const monthlyPrice = Math.round(product.price * 0.25)
  // But that would be misleading if the BE price is the real price. 
  // Let's just show the BE price as the main price, and maybe a fake "original" price 20% higher.
  const displayPrice = product.price;
  const originalPrice = displayPrice * 1.2;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if we wrap in Link later
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 });
      alert('Đã thêm vào giỏ hàng!');
    } catch (e) {
      alert('Lỗi thêm vào giỏ: ' + e);
    }
  };

  return (
    <div className="card flex flex-col h-full min-h-[400px] group relative">
      <div className="bg-transparent">
        <div className="relative w-full p-2 bg-slate-950 pb-[100%]">
          <img 
            src={product.image || 'https://via.placeholder.com/600x600.png?text=Product'} 
            alt={product.name}
            className="absolute inset-0 h-full w-full object-contain transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>
      
      <div className="p-4 flex flex-col h-full">
        <div className="text-xs text-slate-400 mb-1">{product.category?.name || 'Sản phẩm'}</div>
        <h3 className="font-medium text-slate-200 line-clamp-2 min-h-[3rem] mb-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem] mb-4">
          {product.description || 'Mô tả sản phẩm đang được cập nhật...'}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 mb-1">Giá bán</div>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-500 line-through text-xs">{formatPrice(originalPrice)}</span>
              <span className="text-brand text-lg font-semibold">{formatPrice(displayPrice)}</span>
            </div>
          </div>
          
          <button 
            onClick={addToCart}
            className="btn btn-primary p-2 rounded-lg"
            title="Thêm vào giỏ"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
