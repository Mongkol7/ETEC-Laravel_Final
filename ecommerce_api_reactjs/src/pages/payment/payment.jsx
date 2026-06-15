import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ShopHeader from '../../components/layouts/ShopHeader';
import ShopFooter from '../../components/layouts/ShopFooter';
import Loading from '../../components/common/Loading';
import useAuth from '../../hooks/useAuth';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';
import { useToast } from '../../contexts/ToastContext';
import { getCart } from '../../services/cartService';
import { checkout } from '../../services/orderService';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { openLoginPrompt } = useAuthPrompt();
  const { showToast } = useToast();
  const { wishlistCount } = useWishlist();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginPrompt();
      navigate('/cart');
      return;
    }
    loadCartData();
  }, [isAuthenticated]);

  const loadCartData = async () => {
    try {
      setLoading(true);
      // Get cart items from location state or fetch from API
      const locationCartItems = location.state?.cartItems;
      if (locationCartItems && locationCartItems.length > 0) {
        setCartItems(locationCartItems);
      } else {
        const response = await getCart();
        if (response.data.success) {
          setCartItems(response.data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      showToast('Failed to load cart data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
    } else if (field === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    
    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode) {
      showToast('Please fill in all required shipping address fields', 'error');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const address = {
        name: shippingAddress.fullName,
        address: shippingAddress.address,
        city: `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`,
        country: shippingAddress.country,
      };

      const response = await checkout(cartItems, paymentMethod, address);
      
      if (response.data.success) {
        showToast('Payment successful!', 'success');
        // Navigate to order confirmation with order details
        navigate('/order-confirmation', { 
          state: { 
            orderData: response.data.data,
            orderItems: cartItems 
          } 
        });
      } else {
        showToast(response.data.message || 'Payment failed', 'error');
      }
    } catch (err) {
      console.error('Payment error:', err);
      showToast(err.response?.data?.message || 'Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardBrand = () => {
    const num = cardData.cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5')) return 'mastercard';
    if (num.startsWith('3')) return 'amex';
    return null;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0);
  const tax = subtotal * 0.10;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getProductImage = (item) => {
    // Try multiple possible image field names from the API response
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
    <div className="payment-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .payment-root {
          min-height: 100vh;
          background: #050508;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
          overflow-x: hidden;
        }

        .payment-grid-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: linear-gradient(rgba(0, 255, 140, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 140, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .payment-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 28px 48px;
          position: relative;
          z-index: 1;
        }

        .payment-header {
          margin-bottom: 32px;
        }

        .payment-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .payment-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
        }

        .payment-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
          margin-bottom: 48px;
        }

        @media (max-width: 900px) {
          .payment-grid {
            grid-template-columns: 1fr;
          }
        }

        .payment-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(16px);
        }

        .payment-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .payment-method-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .payment-method-tab {
          padding: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .payment-method-tab:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .payment-method-tab.active {
          background: rgba(0, 255, 140, 0.1);
          border-color: rgba(0, 255, 140, 0.3);
        }

        .payment-method-tab.active svg {
          color: #00ff8c;
        }

        .payment-method-tab.active span {
          color: #00ff8c;
        }

        .payment-method-tab svg {
          width: 24px;
          height: 24px;
          color: rgba(255, 255, 255, 0.4);
        }

        .payment-method-tab span {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.4);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-label.required::after {
          content: ' *';
          color: #ff4757;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-input:focus {
          border-color: rgba(0, 255, 140, 0.4);
          box-shadow: 0 0 0 3px rgba(0, 255, 140, 0.08);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .payment-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #00ff8c, #00c9ff);
          border: none;
          border-radius: 12px;
          color: #050508;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 24px;
        }

        .payment-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 140, 0.3);
        }

        .payment-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .order-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .order-item-img {
          width: 80px;
          height: 100px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .order-item-info {
          flex: 1;
          min-width: 0;
        }

        .order-item-name {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .order-item-price {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #00ff8c;
        }

        .order-item-qty {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        .summary-row.total {
          border-bottom: none;
          padding-top: 16px;
          font-size: 18px;
          font-weight: 700;
          color: #00ff8c;
        }

        .summary-value {
          color: #fff;
          font-weight: 600;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
          margin-top: 16px;
        }

        .back-link:hover {
          color: #00ff8c;
        }

        .processing-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .processing-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          max-width: 400px;
        }

        .processing-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(0, 255, 140, 0.2);
          border-top-color: #00ff8c;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .processing-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .processing-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        .empty-state {
          text-align: center;
          padding: 48px 28px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
        }

        .empty-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 24px;
        }

        .continue-btn {
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

        .continue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 140, 0.3);
        }
      `}</style>

      <div className="payment-grid-bg" />
      <ShopHeader cartCount={cartItems.length} wishlistCount={wishlistCount} />

      <main className="payment-main">
        <div className="payment-header">
          <h1 className="payment-title">Checkout</h1>
          <p className="payment-subtitle">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {loading ? (
          <Loading label="Loading payment..." variant="page" />
        ) : cartItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2 className="empty-title">Your cart is empty</h2>
            <p className="empty-text">
              Add some items to your cart before checkout.
            </p>
            <Link to="/shop" className="continue-btn">
              Continue Shopping →
            </Link>
          </div>
        ) : (
          <div className="payment-grid">
            {/* Left Column - Payment Form */}
            <div className="payment-left">
              <div className="payment-card" style={{ marginBottom: '24px' }}>
                <h3 className="payment-section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff8c" strokeWidth="2">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Shipping Address
                </h3>

                <div className="form-group">
                  <label className="form-label required">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Street Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123 Main Street, Apt 4B"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">City</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="New York"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="NY"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">ZIP Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="10001"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="United States"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="payment-card" style={{ marginBottom: '24px' }}>
                <h3 className="payment-section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff8c" strokeWidth="2">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Method
                </h3>

                <div className="payment-method-tabs">
                  <div 
                    className={`payment-method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    <span>Card</span>
                  </div>
                  <div 
                    className={`payment-method-tab ${paymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.633-.072c-2.207 0-4.27.987-5.5 2.86-.96 1.456-1.31 3.21-.99 5.04.32 1.83 1.34 3.45 2.87 4.55 1.43 1.04 3.16 1.49 4.87 1.27.27-.04.53-.1.78-.18l.6-3.81a.64.64 0 00-.63-.74h-2.6c-.52 0-.97-.38-1.05-.9l-.27-1.7c-.08-.52.27-1.01.79-1.09.09-.01.18-.02.27-.02h3.13a.64.64 0 00.63-.54l.74-4.67z"/>
                    </svg>
                    <span>PayPal</span>
                  </div>
                  <div 
                    className={`payment-method-tab ${paymentMethod === 'apple_pay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('apple_pay')}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.93.83 3.66 1.97-.74.5-1.95 1.5-1.95 3.27 0 2.1 1.54 2.85 1.58 2.86-.13.6-.39 1.27-.74 1.91zm-5.91-17c-.04 1.34-1.21 2.66-2.74 2.62.13-1.34 1.21-2.74 2.74-2.62z"/>
                    </svg>
                    <span>Apple Pay</span>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <form onSubmit={handlePayment}>
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="JOHN DOE"
                        value={cardData.cardName}
                        onChange={(e) => setCardData(prev => ({ ...prev, cardName: e.target.value.toUpperCase() }))}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="payment-btn" disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                    </button>
                  </form>
                )}

                {paymentMethod === 'paypal' && (
                  <form onSubmit={handlePayment}>
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                        You'll be redirected to PayPal to complete your purchase securely.
                      </p>
                      <button type="submit" className="payment-btn" disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                      </button>
                    </div>
                  </form>
                )}

                {paymentMethod === 'apple_pay' && (
                  <form onSubmit={handlePayment}>
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                        Use Touch ID or Face ID to pay with Apple Pay.
                      </p>
                      <button type="submit" className="payment-btn" disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="payment-card">
                <h3 className="payment-section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff8c" strokeWidth="2">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order Items ({totalItems})
                </h3>
                {cartItems.map(item => (
                  <div key={item.id} className="order-item">
                    <img 
                      src={getProductImage(item)} 
                      alt={getProductName(item)}
                      className="order-item-img"
                    />
                    <div className="order-item-info">
                      <div className="order-item-name">{getProductName(item)}</div>
                      <div className="order-item-price">${Number(item.price || 0).toFixed(2)}</div>
                      <div className="order-item-qty">Qty: {item.quantity}</div>
                    </div>
                    <div className="order-item-price">
                      ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/cart" className="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                Back to Cart
              </Link>
            </div>

            {/* Right Column - Order Summary */}
            <div className="payment-right">
              <div className="payment-card" style={{ position: 'sticky', top: '80px' }}>
                <h3 className="payment-section-title">Order Summary</h3>
                
                <div className="summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="summary-value">${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span className="summary-value">${tax.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="summary-value" style={{ color: shipping === 0 ? '#00ff8c' : '#fff' }}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span className="summary-value">${total.toFixed(2)}</span>
                </div>

                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0, 255, 140, 0.1)', border: '1px solid rgba(0, 255, 140, 0.3)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff8c" strokeWidth="2">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span style={{ fontSize: '13px', color: '#00ff8c' }}>
                      Your payment information is encrypted and secure.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-card">
            <div className="processing-spinner"></div>
            <h3 className="processing-title">Processing Payment</h3>
            <p className="processing-text">Please don't close this window...</p>
          </div>
        </div>
      )}

      <ShopFooter />
    </div>
  );
}

export default PaymentPage;
