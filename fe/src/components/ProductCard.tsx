import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const addToCart = async () => {
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
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition group">
      <div className="aspect-[4/3] relative overflow-hidden">
        <img 
          src={product.image || 'https://via.placeholder.com/400'} 
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-4">
        <div className="text-xs text-blue-400 font-medium mb-1">
          {product.category?.name || 'Sản phẩm'}
        </div>
        <h3 className="font-semibold text-lg text-white mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-white">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </span>
          <button 
            onClick={addToCart}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
            title="Thêm vào giỏ"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
