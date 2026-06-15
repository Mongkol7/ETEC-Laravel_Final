import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/layouts/ShopHeader';
import ShopFooter from '../../components/layouts/ShopFooter';
import Loading from '../../components/common/Loading';
import useAuth from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';
import { useToast } from '../../contexts/ToastContext';
import { getOrders } from '../../services/orderService';

function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const { openLoginPrompt } = useAuthPrompt();
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [minLoading, setMinLoading] = useState(true);

  useEffect(() => {
    if (isInitializing) return;
    
    if (!isAuthenticated) {
      openLoginPrompt();
      navigate('/');
      return;
    }
    
    // Ensure minimum loading time for better UX
    const minLoadTimer = setTimeout(() => {
      setMinLoading(false);
    }, 500);
    
    loadOrders();
    
    return () => clearTimeout(minLoadTimer);
  }, [isAuthenticated, isInitializing]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

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

  return (
    <div className="orders-root">
      <ShopHeader />
      <main className="orders-main">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">Track and manage your orders</p>
        </div>

        {loading || isInitializing || minLoading ? (
          <div style={{ background: '#050508', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loading label="Loading orders..." variant="page" />
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2 className="orders-empty-title">No orders yet</h2>
            <p className="orders-empty-text">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link to="/shop" className="orders-empty-btn">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="orders-content">
            <div className="orders-filter">
              <button 
                className={`orders-filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Orders
              </button>
              <button 
                className={`orders-filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`orders-filter-btn ${filter === 'processing' ? 'active' : ''}`}
                onClick={() => setFilter('processing')}
              >
                Processing
              </button>
              <button 
                className={`orders-filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
              <button 
                className={`orders-filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>

            <div className="orders-list">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-card-number">
                      <span className="order-card-label">Order #</span>
                      {order.order_number}
                    </div>
                    <div 
                      className="order-card-status"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-card-row">
                      <span className="order-card-label">Date:</span>
                      <span className="order-card-value">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="order-card-row">
                      <span className="order-card-label">Items:</span>
                      <span className="order-card-value">{order.items_count} items</span>
                    </div>
                    <div className="order-card-row">
                      <span className="order-card-label">Payment:</span>
                      <span className="order-card-value">
                        {getPaymentMethodLabel(order.payment_method)}
                      </span>
                    </div>
                    <div className="order-card-row order-card-total">
                      <span className="order-card-label">Total:</span>
                      <span className="order-card-value">
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <Link 
                      to={`/orders/${order.id}`}
                      className="order-card-btn"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <ShopFooter />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .orders-root {
          min-height: 100vh;
          background: #050508;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
          overflow-x: hidden;
        }

        .orders-main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 48px 28px;
          position: relative;
          z-index: 1;
        }

        .orders-header {
          margin-bottom: 32px;
        }

        .orders-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .orders-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
        }

        .orders-empty {
          text-align: center;
          padding: 64px 28px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .orders-empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .orders-empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
        }

        .orders-empty-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 24px;
        }

        .orders-empty-btn {
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

        .orders-empty-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 140, 0.3);
        }

        .orders-content {
          margin-top: 24px;
        }

        .orders-filter {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .orders-filter-btn {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .orders-filter-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .orders-filter-btn.active {
          background: rgba(0, 255, 140, 0.1);
          border-color: rgba(0, 255, 140, 0.3);
          color: #00ff8c;
        }

        .orders-list {
          display: grid;
          gap: 16px;
        }

        .order-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(16px);
          transition: all 0.2s;
        }

        .order-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .order-card-number {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }

        .order-card-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          margin-right: 4px;
        }

        .order-card-status {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .order-card-body {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .order-card-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .order-card-value {
          font-size: 14px;
          color: #fff;
          font-weight: 500;
        }

        .order-card-total {
          grid-column: 1 / -1;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .order-card-total .order-card-value {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #00ff8c;
        }

        .order-card-footer {
          display: flex;
          justify-content: flex-end;
        }

        .order-card-btn {
          padding: 10px 24px;
          background: rgba(0, 255, 140, 0.1);
          border: 1px solid rgba(0, 255, 140, 0.3);
          border-radius: 10px;
          color: #00ff8c;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .order-card-btn:hover {
          background: rgba(0, 255, 140, 0.2);
          transform: translateY(-1px);
        }

        @media (max-width: 600px) {
          .orders-filter {
            overflow-x: auto;
            padding-bottom: 8px;
          }

          .orders-filter-btn {
            white-space: nowrap;
          }

          .order-card-body {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default OrdersPage;
