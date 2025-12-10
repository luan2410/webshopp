import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Order } from '../types';
import { formatPrice } from '../components/ProductCard';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.get('/orders');
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-white">Đang tải...</div>;

  return (
    <div className="container-responsive py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Đơn hàng của bạn</h1>
      
      {orders.length === 0 ? (
        <div className="text-slate-400">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-6">
              <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-4">
                <div>
                  <div className="text-sm text-slate-400">Mã đơn: <span className="text-white font-mono font-bold">{order.code || order.id}</span></div>
                  <div className="text-sm text-slate-400">Ngày: {new Date(order.orderDate).toLocaleString('vi-VN')}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${order.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {order.status}
                  </div>
                  <div className="text-lg font-bold text-brand">{formatPrice(order.totalAmount)}</div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-300">
                      {item.product?.name || 'Sản phẩm'} <span className="text-slate-500">x{item.quantity}</span>
                    </span>
                    <span className="text-slate-300">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-brand/10 border border-brand/30 rounded-lg p-4 mt-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  <span className="font-bold text-brand">📞 Liên hệ nhận key:</span><br/>
                  Vui lòng liên hệ <span className="font-bold text-white">0794174833</span> để được nhận key và hỗ trợ kích hoạt sản phẩm.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
