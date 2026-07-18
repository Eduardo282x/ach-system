
import './App.css'
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/auth/login/Login';
import { useAxiosInterceptor } from './services/interceptors';
import { Layout } from './pages/layout/Layout';
import { Toaster } from "react-hot-toast";
import { Inventory } from './pages/inventory/Inventory';
import { Dispatch } from './pages/dispatch/Dispatch';
import { queryClient } from './lib/query-client';
import { Users } from './pages/users/Users';
import { ExchangeRate } from './pages/exchangeRate/ExchangeRate';
import { HistoryInventory } from './pages/inventory/HistoryInventory';
import { CashDrawerSession } from './pages/cashDrawerSession/CashDrawerSession';
import { CashClosing } from './pages/cashClosing/CashClosing';
import { Invoices } from './pages/invoices/Invoices';
import { ProtectedRoute } from './components/ProtectedRoute';

function AxiosInterceptorProvider() {
  useAxiosInterceptor();
  return null;
};

function App() {
  return (
    <div className="w-screen h-screen bg-gray-100">
      <QueryClientProvider client={queryClient}>
        <AxiosInterceptorProvider />
        <Toaster />
        <RouterProvider router={createBrowserRouter([
          {
            path: '/login',
            element: <Login />
          },
          {
            path: '/',
            element: <Layout />,
            children: [
              {
                path: '/inventario',
                element: <ProtectedRoute allowedRoles={['ADMIN']}><Inventory /></ProtectedRoute>
              },
              {
                path: '/tasas',
                element: <ProtectedRoute allowedRoles={['ADMIN']}><ExchangeRate /></ProtectedRoute>
              },
              {
                path: '/historial-inventario',
                element: <ProtectedRoute allowedRoles={['ADMIN']}><HistoryInventory /></ProtectedRoute>
              },
              {
                path: '/despacho',
                element: <ProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><Dispatch /></ProtectedRoute>
              },
              {
                path: '/cajeros',
                element: <ProtectedRoute allowedRoles={['ADMIN']}><Users /></ProtectedRoute>
              },
              {
                path: '/cierre-caja',
                element: <ProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><CashClosing /></ProtectedRoute>
              },
              {
                path: '/historial-cajeros',
                element: <ProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><CashDrawerSession /></ProtectedRoute>
              },
              {
                path: '/recibo',
                element: <ProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><Invoices /></ProtectedRoute>
              },
              {
                path: '*',
                element: <Navigate to="/inventario" replace />
              }
            ]
          }
        ])}></RouterProvider>
      </QueryClientProvider>
    </div>
  )
}

export default App
