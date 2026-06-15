import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from '../services/cartService';
import useAuth from '../hooks/useAuth';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getCart();
      if (response.data.success) {
        const items = response.data.data || [];
        setCartItems(items);
        // "same product, count as one" -> unique product IDs
        setCartCount(items.length);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setCartCount(0);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const response = await apiAddToCart(productId, quantity);
      if (response.data.success) {
        await loadCart(); // Refresh to get accurate count and items
        return true;
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      throw err;
    }
    return false;
  }, [loadCart]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      const response = await apiRemoveFromCart(productId);
      if (response.data.success) {
        await loadCart();
        return true;
      }
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      throw err;
    }
    return false;
  }, [loadCart]);

  const updateCartCount = useCallback((count) => {
    setCartCount(count);
  }, []);

  const updateCartItems = useCallback((items) => {
    setCartItems(items);
    setCartCount(items.length);
  }, []);

  // Load cart when authentication changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const value = {
    cartCount,
    cartItems,
    isLoading,
    loadCart,
    addToCart,
    removeFromCart,
    updateCartCount,
    updateCartItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
