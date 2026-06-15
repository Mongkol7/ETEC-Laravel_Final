import api from '../api/axios';

// Get all favourite products for authenticated user
export const getFavourites = () => api.get('/user/favourites');

// Toggle item in favourites (add if not exists, remove if exists)
export const toggleFavourite = (productId) =>
  api.post('/user/favourites', {
    product_id: productId,
  });

// Remove item from favourites
export const removeFromFavourites = (productId) =>
  api.delete(`/user/favourites/${productId}`);
