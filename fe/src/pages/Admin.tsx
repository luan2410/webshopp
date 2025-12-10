import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Product, Category, User, Order } from '../types';
import { Trash2, Edit, Plus, X, Package, Users, TrendingUp } from 'lucide-react';
import { formatPrice } from '../components/ProductCard';

type Tab = 'products' | 'categories' | 'users' | 'stats';

export function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('products');

  return (
    <div className="container-responsive py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Quản trị hệ thống</h1>
      
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-1">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${activeTab === 'products' ? 'bg-slate-800 text-brand border-t border-x border-slate-700 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Package className="w-4 h-4" /> Sản phẩm
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${activeTab === 'categories' ? 'bg-slate-800 text-brand border-t border-x border-slate-700 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Package className="w-4 h-4" /> Danh mục
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${activeTab === 'users' ? 'bg-slate-800 text-brand border-t border-x border-slate-700 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Người dùng
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${activeTab === 'stats' ? 'bg-slate-800 text-brand border-t border-x border-slate-700 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <TrendingUp className="w-4 h-4" /> Thống kê
        </button>
      </div>

      <div className="bg-slate-900/50 rounded-b-lg min-h-[500px]">
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'stats' && <StatsDashboard />}
      </div>
    </div>
  );
}

function ProductManager() {
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

  useEffect(() => { loadData(); }, []);

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
      category: { id: Number(categoryId) }
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

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Danh sách sản phẩm</h2>
        <button onClick={() => openModal()} className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Ảnh</th>
              <th className="px-6 py-3">Tên</th>
              <th className="px-6 py-3">Giá</th>
              <th className="px-6 py-3">Danh mục</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-900">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4">{p.id}</td>
                <td className="px-6 py-4">
                  <img src={p.image || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded object-cover" />
                </td>
                <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                <td className="px-6 py-4 text-brand">{formatPrice(p.price)}</td>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tên sản phẩm</label>
                <input required className="input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Giá</label>
                  <input required type="number" className="input" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Danh mục</label>
                  <select required className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Link ảnh</label>
                <input className="input" value={image} onChange={e => setImage(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mô tả</label>
                <textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary w-full font-bold">Lưu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await api.get('/categories');
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, description };

    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      closeModal();
      loadData();
    } catch (e) {
      alert('Lỗi: ' + e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Chắc chắn xóa danh mục này?')) return;
    try {
      await api.delete(`/categories/${id}`);
      loadData();
    } catch (e) {
      alert('Lỗi xóa: ' + e);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditing(category);
      setName(category.name);
      setDescription(category.description || '');
    } else {
      setEditing(null);
      setName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Danh sách danh mục</h2>
        <button onClick={() => openModal()} className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Tên danh mục</th>
              <th className="px-6 py-3">Mô tả</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-900">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4">{c.id}</td>
                <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                <td className="px-6 py-4">{c.description || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModal(c)} className="text-blue-400 hover:text-blue-300 mr-3">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tên danh mục</label>
                <input required className="input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mô tả</label>
                <textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary w-full font-bold">Lưu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('USER');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await api.get('/users');
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditing(user);
    setEmail(user.email || '');
    setFullName(user.fullName || '');
    setRole(user.role || 'USER');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setEmail('');
    setFullName('');
    setRole('USER');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    
    try {
      await api.put(`/users/${editing.id}`, { email, fullName, role });
      closeModal();
      load();
    } catch (e) {
      alert('Lỗi cập nhật: ' + e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa người dùng này?')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (e) {
      alert('Lỗi: ' + e);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Danh sách người dùng</h2>
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-900">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4">{u.id}</td>
                <td className="px-6 py-4 font-bold text-white">{u.username}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.role==='ADMIN'?'bg-red-900 text-red-200':'bg-blue-900 text-blue-200'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEditModal(u)} className="text-blue-400 hover:text-blue-300">
                      <Edit className="w-5 h-5" />
                    </button>
                    {u.role !== 'ADMIN' && (
                      <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Chỉnh sửa người dùng</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                <input disabled className="input bg-slate-800 cursor-not-allowed" value={editing?.username || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input required type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Họ và tên</label>
                <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Vai trò</label>
                <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-full font-bold">Lưu thay đổi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'today' | 'month' | 'year' | 'custom'>('all');

  const loadOrders = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      let url = '/orders';
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (params.toString()) url += '?' + params.toString();
      
      const data = await api.get(url);
      setOrders(data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleFilterChange = (type: typeof filterType) => {
    setFilterType(type);
    const now = new Date();
    
    switch (type) {
      case 'today':
        const today = now.toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
        loadOrders(today, today);
        break;
      
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        setStartDate(monthStart);
        setEndDate(monthEnd);
        loadOrders(monthStart, monthEnd);
        break;
      
      case 'year':
        const yearStart = `${now.getFullYear()}-01-01`;
        const yearEnd = `${now.getFullYear()}-12-31`;
        setStartDate(yearStart);
        setEndDate(yearEnd);
        loadOrders(yearStart, yearEnd);
        break;
      
      case 'all':
        setStartDate('');
        setEndDate('');
        loadOrders();
        break;
      
      case 'custom':
        // User will manually select dates
        break;
    }
  };

  const handleCustomFilter = () => {
    if (startDate && endDate) {
      loadOrders(startDate, endDate);
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status==='Paid'?o.totalAmount:0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== 'Paid').length;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Thống kê doanh thu</h2>
      
      {/* Date Filter */}
      <div className="card p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-400 mb-3">Lọc theo thời gian</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            onClick={() => handleFilterChange('all')}
            className={`btn ${filterType === 'all' ? 'btn-primary' : ''}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => handleFilterChange('today')}
            className={`btn ${filterType === 'today' ? 'btn-primary' : ''}`}
          >
            Hôm nay
          </button>
          <button 
            onClick={() => handleFilterChange('month')}
            className={`btn ${filterType === 'month' ? 'btn-primary' : ''}`}
          >
            Tháng này
          </button>
          <button 
            onClick={() => handleFilterChange('year')}
            className={`btn ${filterType === 'year' ? 'btn-primary' : ''}`}
          >
            Năm nay
          </button>
          <button 
            onClick={() => handleFilterChange('custom')}
            className={`btn ${filterType === 'custom' ? 'btn-primary' : ''}`}
          >
            Tùy chỉnh
          </button>
        </div>
        
        {filterType === 'custom' && (
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Từ ngày</label>
              <input 
                type="date" 
                className="input text-sm" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Đến ngày</label>
              <input 
                type="date" 
                className="input text-sm" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            <button 
              onClick={handleCustomFilter}
              className="btn btn-primary"
              disabled={!startDate || !endDate}
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 border-l-4 border-l-brand">
          <div className="text-slate-400 mb-1">Tổng doanh thu</div>
          <div className="text-3xl font-bold text-white">{formatPrice(totalRevenue)}</div>
        </div>
        <div className="card p-6 border-l-4 border-l-green-500">
          <div className="text-slate-400 mb-1">Tổng đơn hàng</div>
          <div className="text-3xl font-bold text-white">{totalOrders}</div>
        </div>
        <div className="card p-6 border-l-4 border-l-yellow-500">
          <div className="text-slate-400 mb-1">Đơn chưa thanh toán</div>
          <div className="text-3xl font-bold text-white">{pendingOrders}</div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-4">Đơn hàng gần đây</h3>
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Mã đơn</th>
              <th className="px-6 py-3">Ngày</th>
              <th className="px-6 py-3">Khách hàng</th>
              <th className="px-6 py-3">Tổng tiền</th>
              <th className="px-6 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-900">
            {orders.slice(0, 10).map((o) => ( // Show last 10
              <tr key={o.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4 font-mono">{o.code || o.id}</td>
                <td className="px-6 py-4">{new Date(o.orderDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">User #{o.id}</td> 
                <td className="px-6 py-4 text-brand">{formatPrice(o.totalAmount)}</td>
                <td className="px-6 py-4">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
