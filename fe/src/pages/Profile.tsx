import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { User } from '../types';

export function Profile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.get('/users/profile');
      setProfile(data);
      setEmail(data.email || '');
      setFullName(data.fullName || '');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.put('/users/profile', { email, fullName });
      setProfile(updated);
      setProfileMsg('Cập nhật thông tin thành công!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (e: any) {
      setProfileMsg('Lỗi: ' + e.message);
    }
  };

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await api.put(`/users/${profile.id}/password`, { oldPassword, newPassword });
      setMsg('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg('Lỗi: ' + e.message);
    }
  };

  if (!profile) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="container-responsive py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h1>
      
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Thông tin tài khoản</h2>
        {profileMsg && <div className={`mb-4 p-2 rounded ${profileMsg.includes('Lỗi') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>{profileMsg}</div>}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-slate-400">Tên đăng nhập</label>
            <div className="text-white font-medium">{profile.username}</div>
          </div>
          <div>
            <label className="text-sm text-slate-400">Vai trò</label>
            <div className="text-white font-medium">{profile.role}</div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Họ tên</label>
            <input 
              type="text"
              className="input" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)}
              placeholder="Nhập họ tên của bạn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input 
              type="email"
              className="input" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">Cập nhật thông tin</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Đổi mật khẩu</h2>
        {msg && <div className={`mb-4 p-2 rounded ${msg.includes('Lỗi') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>{msg}</div>}
        
        <form onSubmit={handleChangePass} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu cũ</label>
            <input 
              type="password" 
              required 
              className="input" 
              value={oldPassword} 
              onChange={e => setOldPassword(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu mới</label>
            <input 
              type="password" 
              required 
              className="input" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">Lưu thay đổi</button>
        </form>
      </div>
    </div>
  );
}
