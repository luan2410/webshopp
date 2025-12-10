import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { CartItem } from '../types';
import { Trash2, CreditCard, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await api.get('/cart');
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    try {
      await api.put(`/cart/${id}`, { quantity: newQuantity });
      loadCart();
    } catch (e) {
      alert('Lỗi cập nhật: ' + e);
    }
  };

  const removeItem = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await api.delete(`/cart/${id}`);
      loadCart();
    } catch (e) {
      alert('Lỗi xóa: ' + e);
    }
  };

  const checkout = async () => {
    // Note: For digital products, shippingAddress is used as Order Note/Email
    if (!address.trim()) return alert('Vui lòng nhập Email hoặc Ghi chú để nhận sản phẩm');
    if (items.length === 0) return alert('Giỏ hàng trống');
    
    try {
      await api.post('/orders', { shippingAddress: address });
      alert('Đặt hàng thành công! Vui lòng kiểm tra mục Đơn hàng.');
      setItems([]);
      navigate('/orders');
    } catch (e) {
      alert('Lỗi đặt hàng: ' + e);
    }
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) return <div className="text-center py-10 text-white">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Giỏ hàng của bạn</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.length === 0 ? (
            <div className="text-slate-400">Giỏ hàng trống.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-4 mb-3">
                  <img src={item.product.image || 'https://via.placeholder.com/100'} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.product.name}</h3>
                    <p className="text-blue-400 text-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price)}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-slate-700 hover:bg-slate-600 text-white w-8 h-8 rounded flex items-center justify-center transition"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-medium w-12 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-slate-700 hover:bg-slate-600 text-white w-8 h-8 rounded flex items-center justify-center transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-brand font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Tổng cộng</h2>
            <div className="flex justify-between text-white text-lg font-bold mb-6">
              <span>Thành tiền:</span>
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">Ghi chú đơn hàng (Email nhận key)</label>
              <textarea 
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập email của bạn để nhận key hoặc yêu cầu khác..."
              ></textarea>
            </div>

            <button 
              onClick={checkout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
            >
              <CreditCard className="w-5 h-5" />
              Thanh toán
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
