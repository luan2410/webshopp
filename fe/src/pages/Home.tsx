import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { ProductCard } from '../components/ProductCard';
import { api } from '../api';
import { Product } from '../types';

type SortOrder = 'asc' | 'desc' | 'none';

export function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter States
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('none');
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  
  // Pagination per section is tricky if we do sections, so we might skip "Load More" for the main view
  // or just show all items per category for simplicity, or limited items per category.
  // Let's show limited items per category with a "See all" button that filters to that category.
  const [visible, setVisible] = useState<number>(8); // Only used when a specific category is active

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/products');
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Không thể tải dữ liệu sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract categories dynamically from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.category?.name && set.add(p.category.name));
    return Array.from(set);
  }, [products]);

  // Helper to filter/sort a list
  const processList = (list: Product[]) => {
    let result = list;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    if (sort !== 'none') {
      result = [...result].sort((a, b) => sort === 'asc' ? a.price - b.price : b.price - a.price);
    }
    return result;
  };

  return (
    <div className="container-responsive py-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-full">
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chào mừng đến với WebShop</h1>
        {user ? (
          <p className="text-slate-400">
            Xin chào, <span className="font-semibold text-brand">{user.username}</span>
          </p>
        ) : (
          <p className="text-slate-400">Vui lòng đăng nhập để mua hàng</p>
        )}
      </div>

      {/* Search & Sort Controls */}
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
            <button 
              className={`btn w-full xs:w-auto ${sort==='asc'?'btn-primary':''}`} 
              onClick={() => setSort(sort==='asc'?'none':'asc')}
            >
              Giá ↑
            </button>
            <button 
              className={`btn w-full xs:w-auto ${sort==='desc'?'btn-primary':''}`} 
              onClick={() => setSort(sort==='desc'?'none':'desc')}
            >
              Giá ↓
            </button>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button 
          className={`btn ${activeCategory==='Tất cả'?'btn-primary':''}`} 
          onClick={()=>setActiveCategory('Tất cả')}
        >
          Tất cả
        </button>
        {categories.map(c => (
          <button 
            key={c} 
            className={`btn ${activeCategory===c?'btn-primary':''}`} 
            onClick={()=>{
              setActiveCategory(c);
              setVisible(8); // Reset visible count when switching category
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-10 text-slate-400">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-slate-400 mb-4">Hiện chưa có sản phẩm nào.</p>
          {user?.role === 'ADMIN' && (
            <a href="/admin" className="btn btn-primary">
              Thêm sản phẩm ngay
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {activeCategory === 'Tất cả' && !query ? (
            // Show grouped sections
            categories.length > 0 ? (
              categories.map(cat => {
                const catProducts = processList(products.filter(p => p.category?.name === cat));
                if (catProducts.length === 0) return null;

                return (
                  <section key={cat}>
                    <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
                      <h2 className="text-2xl font-bold text-white">{cat}</h2>
                      <button 
                        onClick={() => setActiveCategory(cat)}
                        className="text-brand hover:text-brand-dark text-sm font-medium transition"
                      >
                        Xem tất cả &rarr;
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {catProducts.slice(0, 4).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              <div className="text-center text-slate-400 py-10">Không tìm thấy danh mục nào.</div>
            )
          ) : (
            // Show flat list (Specific category or Search results)
            <section>
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-white">
                   {activeCategory === 'Tất cả' ? 'Kết quả tìm kiếm' : activeCategory}
                 </h2>
                 <span className="text-slate-400 text-sm">
                   {processList(activeCategory === 'Tất cả' ? products : products.filter(p => p.category?.name === activeCategory)).length} sản phẩm
                 </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {processList(
                  activeCategory === 'Tất cả' 
                    ? products 
                    : products.filter(p => p.category?.name === activeCategory)
                ).slice(0, visible).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {processList(
                  activeCategory === 'Tất cả' 
                    ? products 
                    : products.filter(p => p.category?.name === activeCategory)
                ).length > visible && (
                <div className="mt-8 flex justify-center">
                  <button className="btn btn-primary px-8 py-3" onClick={()=>setVisible(v=>v+8)}>
                    Xem thêm
                  </button>
                </div>
              )}
            </section>
          )}
          
          {/* Handle empty search results */}
          {activeCategory === 'Tất cả' && query && processList(products).length === 0 && (
             <div className="text-center text-slate-400 py-10">Không tìm thấy sản phẩm nào phù hợp với "{query}".</div>
          )}
        </div>
      )}
    </div>
  );
}
