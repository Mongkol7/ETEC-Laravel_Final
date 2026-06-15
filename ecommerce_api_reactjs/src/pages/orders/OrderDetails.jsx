import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/layouts/ShopHeader';
import ShopFooter from '../../components/layouts/ShopFooter';
import Loading from '../../components/common/Loading';
import useAuth from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';
import { useToast } from '../../contexts/ToastContext';
import { getOrderById, cancelOrder } from '../../services/orderService';

function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const { openLoginPrompt } = useAuthPrompt();
  const { showToast } = useToast();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [minLoading, setMinLoading] = useState(true);

  useEffect(() => {
    if (isInitializing) return;
    
    if (!isAuthenticated) {
      openLoginPrompt();
      navigate('/orders');
      return;
    }
    
    // Ensure minimum loading time for better UX
    const minLoadTimer = setTimeout(() => {
      setMinLoading(false);
    }, 500);
    
    loadOrder();
    
    return () => clearTimeout(minLoadTimer);
  }, [isAuthenticated, isInitializing, id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(id);
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        showToast(response.data.message || 'Failed to load order details', 'error');
        navigate('/orders');
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      showToast('Failed to load order details', 'error');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setCancelling(true);
      const response = await cancelOrder(id);
      if (response.data.success) {
        showToast('Order cancelled successfully', 'success');
        loadOrder(); // Reload order to get updated status
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffa500';
      case 'processing':
        return '#00c9ff';
      case 'completed':
        return '#00ff8c';
      case 'cancelled':
        return '#ff4757';
      default:
        return '#fff';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'card':
        return 'Card';
      case 'paypal':
        return 'PayPal';
      case 'apple_pay':
        return 'Apple Pay';
      default:
        return method;
    }
  };

  const getProductImage = (item) => {
    if (item.image) return item.image;
    return 'https://images.unsplash.com/photo-1621351183012-e2f6d86f5b9e?w=200&h=300&fit=crop&q=80';
  };

  if (loading || isInitializing || minLoading) {
    return (
      <div className="order-details-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

          .order-details-root {
            min-height: 100vh;
            background: #050508;
            font-family: 'DM Sans', sans-serif;
            position: relative;
            width: 100%;
            overflow-x: hidden;
          }

          .order-details-main {
            max-width: 1000px;
            margin: 0 auto;
            padding: 48px 28px;
            position: relative;
            z-index: 1;
            min-height: calc(100vh - 64px);
          }

          .order-details-header {
            margin-bottom: 32px;
          }

          .order-details-back {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.5);
            text-decoration: none;
            font-size: 14px;
            margin-bottom: 16px;
            transition: color 0.2s;
          }

          .order-details-back:hover {
            color: #00ff8c;
          }

          .order-details-title {
            font-family: 'Syne', sans-serif;
            font-size: clamp(28px, 4vw, 40px);
            font-weight: 800;
            color: #fff;
            line-height: 1.15;
          }
        `}</style>
        <ShopHeader />
        <main className="order-details-main" style={{ background: '#050508' }}>
          <div className="order-details-header">
            <Link to="/orders" className="order-details-back">
              ← Back to Orders
            </Link>
            <h1 className="order-details-title">Order Details</h1>
          </div>
          <Loading label="Loading order details..." variant="page" />
        </main>
        <ShopFooter />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght:700;800&family=DM+Sans:wght:300;400;500&display=swap');

          .order-details-root {
            min-height: 100vh;
            background: #050508;
            font-family: 'DM Sans', sans-serif;
            position: relative;
            width: 100%;
            overflow-x: hidden;
          }

          .order-details-main {
            max-width: 1000px;
            margin: 0 auto;
            padding: 48px 28px;
            position: relative;
            z-index: 1;
            min-height: calc(100vh - 64px);
          }

          .order-details-header {
            margin-bottom: 32px;
          }

          .order-details-back {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.5);
            text-decoration: none;
            font-size: 14px;
            margin-bottom: 16px;
            transition: color 0.2s;
          }

          .order-details-back:hover {
            color: #00ff8c;
          }

          .order-details-title {
            font-family: 'Syne', sans-serif;
            font-size: clamp(28px, 4vw, 40px);
            font-weight: 800;
            color: #fff;
            line-height: 1.15;
          }

          .order-details-error {
            text-align: center;
            padding: 64px 28px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.07);
          }

          .order-details-error-title {
            font-family: 'Syne', sans-serif;
            font-size: 24px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 8px;
          }

          .order-details-error-text {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.45);
            margin-bottom: 24px;
          }

          .order-details-error-btn {
            display: inline-block;
            padding: 12px 28px;
            background: linear-gradient(135deg, #00ff8c, #00c9ff);
            border: none;
            border-radius: 12px;
            color: #050508;
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 13px;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
          }

          .order-details-error-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 255, 140, 0.3);
          }
        `}</style>
        <ShopHeader />
        <main className="order-details-main" style={{ background: '#050508' }}>
          <div className="order-details-header">
            <Link to="/orders" className="order-details-back">
              ← Back to Orders
            </Link>
            <h1 className="order-details-title">Order Details</h1>
          </div>
          <div className="order-details-error">
            <h2 className="order-details-error-title">Order Not Found</h2>
            <p className="order-details-error-text">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link to="/orders" className="order-details-error-btn">
              Back to Orders
            </Link>
          </div>
        </main>
        <ShopFooter />
      </div>
    );
  }

  // Check if order has items and provide safe defaults
  const orderItems = order.items && Array.isArray(order.items) ? order.items : [];
  const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0);
  const tax = subtotal * 0.10;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const isWithin24Hours = order ? (new Date().getTime() - new Date(order.created_at).getTime()) < (24 * 60 * 60 * 1000) : false;
  const canCancel = (order.status === 'pending' || order.status === 'processing') && isWithin24Hours;

  return (
    <div className="order-details-root">
      <ShopHeader />
      <main className="order-details-main">
        <div className="order-details-header">
          <Link to="/orders" className="order-details-back">
            ← Back to Orders
          </Link>
          <h1 className="order-details-title">Order Details</h1>
        </div>

        <div className="order-details-content">
          {/* Order Info Card */}
          <div className="order-details-card">
            <div className="order-details-card-header">
              <div className="order-details-card-title">Order Information</div>
              <div 
                className="order-details-status-badge"
                style={{ 
                  background: `${getStatusColor(order.status)}20`,
                  color: getStatusColor(order.status),
                  borderColor: getStatusColor(order.status)
                }}
              >
                {getStatusLabel(order.status)}
              </div>
            </div>

            <div className="order-details-info-grid">
              <div className="order-details-info-item">
                <span className="order-details-info-label">Order Number</span>
                <span className="order-details-info-value">{order.order_number}</span>
              </div>
              <div className="order-details-info-item">
                <span className="order-details-info-label">Order Date</span>
                <span className="order-details-info-value">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="order-details-info-item">
                <span className="order-details-info-label">Payment Method</span>
                <span className="order-details-info-value">
                  {getPaymentMethodLabel(order.payment_method)}
                </span>
              </div>
              <div className="order-details-info-item">
                <span className="order-details-info-label">Payment Status</span>
                <span className="order-details-info-value">
                  {order.payment_status === 'paid' ? 'Paid' : order.payment_status}
                </span>
              </div>
            </div>

            {canCancel && (
              <button 
                className="order-details-cancel-btn"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>

          {/* Order Items Card */}
          <div className="order-details-card">
            <div className="order-details-card-title">Order Items</div>
            
            <div className="order-details-items">
              {orderItems.length > 0 ? (
                orderItems.map(item => (
                  <div key={item.id} className="order-details-item">
                    <img 
                      src={getProductImage(item)} 
                      alt={item.product_name}
                      className="order-details-item-img"
                    />
                    <div className="order-details-item-info">
                      <div className="order-details-item-name">{item.product_name}</div>
                      <div className="order-details-item-qty">Quantity: {item.quantity}</div>
                      <div className="order-details-item-price">
                        ${Number(item.price).toFixed(2)} each
                      </div>
                    </div>
                    <div className="order-details-item-subtotal">
                      ${Number(item.subtotal).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.5)', padding: '20px 0' }}>
                  No items in this order
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="order-details-card">
            <div className="order-details-card-title">Order Summary</div>
            
            <div className="order-details-summary">
              <div className="order-details-summary-row">
                <span>Subtotal ({orderItems.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="order-details-summary-row">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="order-details-summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="order-details-summary-row order-details-summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          {order.shipping_address && (
            <div className="order-details-card">
              <div className="order-details-card-title">Shipping Address</div>
              
              <div className="order-details-address">
                <div className="order-details-address-name">
                  {order.shipping_address.name}
                </div>
                <div className="order-details-address-line">
                  {order.shipping_address.address}
                </div>
                <div className="order-details-address-line">
                  {order.shipping_address.city}
                </div>
                <div className="order-details-address-line">
                  {order.shipping_address.country}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <ShopFooter />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .order-details-root {
          min-height: 100vh;
          background: #050508;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
          overflow-x: hidden;
        }

        .order-details-main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 48px 28px;
          position: relative;
          z-index: 1;
          min-height: calc(100vh - 64px);
        }

        .order-details-header {
          margin-bottom: 32px;
        }

        .order-details-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 16px;
          transition: color 0.2s;
        }

        .order-details-back:hover {
          color: #00ff8c;
        }

        .order-details-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
        }

        .order-details-content {
          display: grid;
          gap: 24px;
          position: relative;
          z-index: 2;
        }

        .order-details-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 28px;
          backdrop-filter: blur(16px);
        }

        .order-details-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .order-details-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }

        .order-details-status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid;
        }

        .order-details-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .order-details-info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .order-details-info-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 500;
        }

        .order-details-info-value {
          font-size: 14px;
          color: #fff;
          font-weight: 500;
        }

        .order-details-cancel-btn {
          margin-top: 20px;
          padding: 12px 24px;
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid rgba(255, 71, 87, 0.3);
          border-radius: 10px;
          color: #ff4757;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .order-details-cancel-btn:hover:not(:disabled) {
          background: rgba(255, 71, 87, 0.2);
        }

        .order-details-cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .order-details-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-details-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
        }

        .order-details-item-img {
          width: 80px;
          height: 100px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .order-details-item-info {
          flex: 1;
          min-width: 0;
        }

        .order-details-item-name {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 6px;
        }

        .order-details-item-qty {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 4px;
        }

        .order-details-item-price {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
        }

        .order-details-item-subtotal {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #00ff8c;
        }

        .order-details-summary {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
        }

        .order-details-summary-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        .order-details-summary-row span:last-child {
          color: #fff;
          font-weight: 500;
        }

        .order-details-summary-total {
          font-size: 18px;
          font-weight: 700;
          color: #00ff8c;
          padding-top: 16px;
          margin-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .order-details-address {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .order-details-address-name {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
        }

        .order-details-address-line {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        .order-details-error {
          text-align: center;
          padding: 64px 28px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .order-details-error-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
        }

        .order-details-error-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 24px;
        }

        .order-details-error-btn {
          display: inline-block;
          padding: 12px 28px;
          background: linear-gradient(135deg, #00ff8c, #00c9ff);
          border: none;
          border-radius: 12px;
          color: #050508;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .order-details-error-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 140, 0.3);
        }

        @media (max-width: 600px) {
          .order-details-info-grid {
            grid-template-columns: 1fr;
          }

          .order-details-item {
            flex-direction: column;
          }

          .order-details-item-img {
            width: 100%;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}

export default OrderDetailsPage;
