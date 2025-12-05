import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Product, Category } from '../types';
import { Trash2, Edit, Plus, X } from 'lucide-react';

export function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes);
      setCategories(catRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      price: Number(price),
      image,
      description,
      category: { id: Number(categoryId) } // Backend expects object
    };

    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      closeModal();
      loadData();
    } catch (e) {
      alert('Lỗi: ' + e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Chắc chắn xóa?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadData();
    } catch (e) {
      alert('Lỗi xóa: ' + e);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditing(product);
      setName(product.name);
      setPrice(String(product.price));
      setImage(product.image);
      setDescription(product.description);
      setCategoryId(String(product.category?.id || ''));
    } else {
      setEditing(null);
      setName('');
      setPrice('');
      setImage('');
      setDescription('');
      setCategoryId(categories[0]?.id.toString() || '');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  if (loading) return <div className="text-center py-10 text-white">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý sản phẩm</h1>
        <button 
          onClick={() => openModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" /> Thêm mới
        </button>
      </div>

      <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Ảnh</th>
              <th className="px-6 py-3">Tên</th>
              <th className="px-6 py-3">Giá</th>
              <th className="px-6 py-3">Danh mục</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4">{p.id}</td>
                <td className="px-6 py-4">
                  <img src={p.image || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded object-cover" />
                </td>
                <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                <td className="px-6 py-4 text-blue-400">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                </td>
                <td className="px-6 py-4">{p.category?.name || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModal(p)} className="text-blue-400 hover:text-blue-300 mr-3">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tên sản phẩm</label>
                <input required className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Giá</label>
                  <input required type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Danh mục</label>
                  <select required className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Link ảnh</label>
                <input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" value={image} onChange={e => setImage(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mô tả</label>
                <textarea className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition">
                Lưu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
