import { BrowserRouter } from 'react-router-dom';
import { AuthPromptProvider } from './contexts/AuthPromptContext';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import AuthProvider from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthPromptProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <AppRoutes />
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthPromptProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
