import api from '../api/axios';

// Get all cart items for authenticated user
export const getCart = () => api.get('/user/cart');

// Add or update item in cart
export const addToCart = (productId, quantity) =>
  api.post('/user/cart', {
    product_id: productId,
    quantity: quantity,
  });

// Update quantity of item in cart
export const updateCartItem = (productId, quantity) =>
  api.put(`/user/cart/${productId}`, {
    quantity: quantity,
  });

// Remove item from cart
export const removeFromCart = (productId) =>
  api.delete(`/user/cart/${productId}`);

// Clear entire cart
export const clearCart = () => api.post('/user/cart/clear');
