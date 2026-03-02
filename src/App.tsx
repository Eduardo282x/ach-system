
import './App.css'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/auth/login/Login';
import { useAxiosInterceptor } from './services/interceptors';
import { Layout } from './pages/layout/Layout';
import { Customers } from './pages/customers/Customers';
import { Toaster } from "react-hot-toast";
import { Home } from './pages/home/Home';
import { Inventory } from './pages/inventory/Inventory';
import { Dispatch } from './pages/dispatch/Dispatch';
import { queryClient } from './lib/query-client';

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
                path: '/',
                element: <Home />
              },
              {
                path: '/inventario',
                element: <Inventory />
              },
              {
                path: '/despacho',
                element: <Dispatch />
              },
              {
                path: '/clientes',
                element: <Customers />
              }
            ]
          }
        ])}></RouterProvider>
      </QueryClientProvider>
    </div>
  )
}

export default App
