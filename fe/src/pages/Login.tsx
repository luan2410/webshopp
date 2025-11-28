import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.token, res.role);
      navigate('/');
    } catch (e) {
      setError('Đăng nhập thất bại: ' + e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Đăng nhập</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-center text-sm">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white placeholder-slate-400 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white placeholder-slate-400 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Đăng nhập
            </button>
          </div>
          <div className="text-center text-sm">
            <Link to="/register" className="text-blue-400 hover:text-blue-300">Chưa có tài khoản? Đăng ký ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
