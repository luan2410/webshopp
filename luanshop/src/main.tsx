import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { App } from './modules/App'
import { ProductPage } from './modules/pages/ProductPage'
import { AdminLogin } from './modules/pages/AdminLogin'
import { AdminDashboard } from './modules/pages/AdminDashboard'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/product/:id', element: <ProductPage /> },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/admin', element: <AdminDashboard /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)


