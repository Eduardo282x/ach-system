
import './App.css'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Login } from './pages/auth/login/Login';
import { useAxiosInterceptor } from './services/interceptors';
import { Layout } from './pages/layout/Layout';
import { Customers } from './pages/customers/Customers';
import { Toaster } from "react-hot-toast";

function AxiosInterceptorProvider() {
  useAxiosInterceptor();
  return null;
};

function App() {

  return (
    <div className="w-screen h-screen bg-gray-100">
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
              path: '/clientes',
              element: <Customers />
            }
          ]
        }
      ])}></RouterProvider>
    </div>
  )
}

export default App
