import api from '../api/axios';

// Process checkout and create order
export const checkout = (cartItems, paymentMethod, shippingAddress) => {
  return api.post('/user/orders/checkout', {
    payment_method: paymentMethod,
    shipping_address: shippingAddress,
  });
};

// Get user's order history
export const getOrders = () => api.get('/user/orders');

// Get specific order details
export const getOrderById = (orderId) => api.get(`/user/orders/${orderId}`);

// Cancel order
export const cancelOrder = (orderId) => api.post(`/user/orders/${orderId}/cancel`);
