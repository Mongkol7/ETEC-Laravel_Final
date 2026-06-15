import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/layouts/ShopHeader';
import ShopFooter from '../../components/layouts/ShopFooter';
import Loading from '../../components/common/Loading';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;
  const orderItems = location.state?.orderItems || [];
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  if (!orderData) {
    return (
      <div className="order-confirmation-root">
        <ShopHeader cartCount={cartCount} wishlistCount={wishlistCount} />
        <main className="order-confirmation-main">
          <div className="order-confirmation-card">
            <h2 className="order-confirmation-title">Order Not Found</h2>
            <p className="order-confirmation-text">
              No order information available. Please check your order history.
            </p>
            <Link to="/orders" className="order-confirmation-btn">
              View Order History
            </Link>
          </div>
        </main>
        <ShopFooter />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

          .order-confirmation-root {
            min-height: 100vh;
            background: #050508;
            font-family: 'DM Sans', sans-serif;
            position: relative;
            width: 100%;
            overflow-x: hidden;
          }

          .order-confirmation-main {
            max-width: 800px;
            margin: 0 auto;
            padding: 48px 28px;
            position: relative;
            z-index: 1;
          }

          .order-confirmation-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 20px;
            padding: 40px;
            backdrop-filter: blur(16px);
            text-align: center;
          }

          .order-confirmation-title {
            font-family: 'Syne', sans-serif;
            font-size: 28px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 16px;
          }

          .order-confirmation-text {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 24px;
          }

          .order-confirmation-btn {
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

          .order-confirmation-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 255, 140, 0.3);
          }
        `}</style>
      </div>
    );
  }

  const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0);
  const tax = subtotal * 0.10;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const getProductImage = (item) => {
    if (item.product && item.product.product_image) {
      return item.product.product_image;
    }
    if (item.product && item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
      const firstImage = item.product.images[0];
      return firstImage.image_url || firstImage.url || firstImage;
    }
    if (item.product_image) return item.product_image;
    if (item.imageUrl) return item.imageUrl;
    if (item.image) return item.image;
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];
      return firstImage.image_url || firstImage.url || firstImage;
    }
    return 'https://images.unsplash.com/photo-1621351183012-e2f6d86f5b9e?w=200&h=300&fit=crop&q=80';
  };

  const getProductName = (item) => {
    return item.name || item.product?.name || 'Product';
  };

  return (
    <div className="order-confirmation-root">
      <ShopHeader cartCount={0} />
      <main className="order-confirmation-main">
        <div className="order-confirmation-card">
          <div className="order-confirmation-icon">✓</div>
          <h1 className="order-confirmation-title">Order Confirmed!</h1>
          <p className="order-confirmation-subtitle">
            Thank you for your purchase. Your order has been successfully placed.
          </p>

          <div className="order-confirmation-details">
            <div className="order-confirmation-detail-row">
              <span className="order-confirmation-detail-label">Order Number:</span>
              <span className="order-confirmation-detail-value">{orderData.order_number}</span>
            </div>
            <div className="order-confirmation-detail-row">
              <span className="order-confirmation-detail-label">Total Amount:</span>
              <span className="order-confirmation-detail-value">${Number(orderData.total_amount).toFixed(2)}</span>
            </div>
            <div className="order-confirmation-detail-row">
              <span className="order-confirmation-detail-label">Status:</span>
              <span className="order-confirmation-detail-value order-confirmation-status">
                {orderData.status}
              </span>
            </div>
          </div>

          <div className="order-confirmation-items">
            <h3 className="order-confirmation-items-title">Order Items</h3>
            {orderItems.map(item => (
              <div key={item.id} className="order-confirmation-item">
                <img 
                  src={getProductImage(item)} 
                  alt={getProductName(item)}
                  className="order-confirmation-item-img"
                />
                <div className="order-confirmation-item-info">
                  <div className="order-confirmation-item-name">{getProductName(item)}</div>
                  <div className="order-confirmation-item-qty">Qty: {item.quantity}</div>
                </div>
                <div className="order-confirmation-item-price">
                  ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-confirmation-summary">
            <div className="order-confirmation-summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="order-confirmation-summary-row">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="order-confirmation-summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="order-confirmation-summary-row order-confirmation-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="order-confirmation-actions">
            <Link to="/shop" className="order-confirmation-btn order-confirmation-btn-primary">
              Continue Shopping
            </Link>
            <Link to="/orders" className="order-confirmation-btn order-confirmation-btn-secondary">
              View Order Details
            </Link>
          </div>
        </div>
      </main>
      <ShopFooter />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .order-confirmation-root {
          min-height: 100vh;
          background: #050508;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
          overflow-x: hidden;
        }

        .order-confirmation-main {
          max-width: 800px;
          margin: 0 auto;
          padding: 48px 28px;
          position: relative;
          z-index: 1;
        }

        .order-confirmation-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 40px;
          backdrop-filter: blur(16px);
        }

        .order-confirmation-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #00ff8c, #00c9ff);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 40px;
          color: #050508;
          font-weight: bold;
        }

        .order-confirmation-title {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          text-align: center;
          margin-bottom: 12px;
        }

        .order-confirmation-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-bottom: 32px;
        }

        .order-confirmation-details {
          background: rgba(0, 255, 140, 0.05);
          border: 1px solid rgba(0, 255, 140, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .order-confirmation-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .order-confirmation-detail-label {
          color: rgba(255, 255, 255, 0.5);
        }

        .order-confirmation-detail-value {
          color: #fff;
          font-weight: 500;
        }

        .order-confirmation-status {
          color: #00ff8c;
          font-weight: 600;
        }

        .order-confirmation-items {
          margin-bottom: 24px;
        }

        .order-confirmation-items-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
        }

        .order-confirmation-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .order-confirmation-item-img {
          width: 80px;
          height: 100px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .order-confirmation-item-info {
          flex: 1;
          min-width: 0;
        }

        .order-confirmation-item-name {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .order-confirmation-item-qty {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        .order-confirmation-item-price {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #00ff8c;
        }

        .order-confirmation-summary {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
          margin-bottom: 32px;
        }

        .order-confirmation-summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        .order-confirmation-summary-row span:last-child {
          color: #fff;
          font-weight: 500;
        }

        .order-confirmation-summary-total {
          font-size: 18px;
          font-weight: 700;
          color: #00ff8c;
          padding-top: 16px;
          margin-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .order-confirmation-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .order-confirmation-btn {
          flex: 1;
          min-width: 200px;
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .order-confirmation-btn-primary {
          background: linear-gradient(135deg, #00ff8c, #00c9ff);
          color: #050508;
        }

        .order-confirmation-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 140, 0.3);
        }

        .order-confirmation-btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .order-confirmation-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

export default OrderConfirmation;
