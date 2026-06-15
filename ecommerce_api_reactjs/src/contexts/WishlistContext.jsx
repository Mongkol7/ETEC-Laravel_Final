import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFavourites, toggleFavourite as apiToggleFavourite } from '../services/favouriteService';
import useAuth from '../hooks/useAuth';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      setWishlistItems([]);
      setWishlist(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const response = await getFavourites();
      if (response.data.success) {
        const items = response.data.data || [];
        setWishlistItems(items);
        setWishlist(new Set(items.map((item) => item.id)));
        setWishlistCount(items.length);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setWishlistCount(0);
      setWishlistItems([]);
      setWishlist(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const toggleWishlistItem = useCallback(async (itemId) => {
    try {
      const response = await apiToggleFavourite(itemId);
      if (response.data.success) {
        await loadWishlist(); // Refresh to get accurate count and items
        return true;
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      throw err;
    }
    return false;
  }, [loadWishlist]);

  const updateWishlistCount = useCallback((count) => {
    setWishlistCount(count);
  }, []);

  const updateWishlist = useCallback((newWishlist) => {
    setWishlist(newWishlist);
    setWishlistCount(newWishlist.size);
  }, []);

  // Load wishlist when authentication changes
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const value = {
    wishlistCount,
    wishlistItems,
    wishlist,
    isLoading,
    loadWishlist,
    updateWishlistCount,
    updateWishlist,
    toggleWishlistItem,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
