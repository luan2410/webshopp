import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ShoppingCart, User, Settings, LogOut } from 'lucide-react';

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition flex-shrink-0">
          WebShop
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-slate-300 hover:text-white transition font-medium">Trang chủ</Link>
          <Link to="/cart" className="text-slate-300 hover:text-white transition flex items-center gap-1 font-medium">
            <ShoppingCart className="w-5 h-5" /> Giỏ hàng
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4 border-l border-slate-600 pl-4 ml-2">
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="text-slate-300 hover:text-white transition flex items-center gap-1 font-medium">
                  <Settings className="w-5 h-5" /> Admin
                </Link>
              )}
              <Link to="/orders" className="text-slate-300 hover:text-white transition font-medium">Đơn hàng</Link>
              <Link to="/profile" className="text-slate-300 flex items-center gap-2 hover:text-white transition">
                 <User className="w-5 h-5" /> <span className="hidden sm:inline">{user.username}</span>
              </Link>
              <button 
                onClick={logout} 
                className="text-red-400 hover:text-red-300 transition flex items-center gap-1"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l border-slate-600 pl-4 ml-2">
              <Link to="/login" className="text-slate-300 hover:text-white transition font-medium">Đăng nhập</Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-bold"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
