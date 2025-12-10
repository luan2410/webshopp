import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Admin } from './pages/Admin';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { PrivateRoute } from './components/PrivateRoute';
import { NavBar } from './components/NavBar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col font-sans">
          <NavBar />
          
          <main className="flex-grow w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute roles={['ADMIN']}>
                    <Admin />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>

          <footer className="bg-slate-950 py-8 border-t border-slate-800 w-full mt-auto">
             <div className="container mx-auto px-4 text-center text-slate-500">
               <p>&copy; {new Date().getFullYear()} WebShop - Cửa hàng phần mềm bản quyền</p>
               <p className="text-sm mt-2">Được xây dựng bằng Java/Jakarta EE & React/Vite</p>
             </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
