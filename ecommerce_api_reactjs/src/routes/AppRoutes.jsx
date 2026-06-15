import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import Loading from '../components/common/Loading';

const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const Home = lazy(() => import('../pages/home/Home'));
const Shop = lazy(() => import('../pages/shop/Shop'));
const Cart = lazy(() => import('../pages/cart/Cart'));
const Payment = lazy(() => import('../pages/payment/payment'));
const OrderConfirmation = lazy(() => import('../pages/order-confirmation/OrderConfirmation'));
const Orders = lazy(() => import('../pages/orders/Orders'));
const OrderDetails = lazy(() => import('../pages/orders/OrderDetails'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const Unauthorized = lazy(() => import('../pages/errors/Unauthorized'));
const UserList = lazy(() => import('../pages/users/UserList'));
const ProductList = lazy(() => import('../pages/products/ProductList'));
const ProductDetail = lazy(() => import('../pages/products/ProductDetail'));
const Favourite = lazy(() => import('../pages/favourite/Favourite'));
const AdminLayout = lazy(() => import('../components/layouts/AdminLayout'));

function AppRoutes() {
  return (
    <Suspense fallback={<Loading label="Loading page..." variant="screen" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/favourite" element={<Favourite />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="products" element={<ProductList />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
