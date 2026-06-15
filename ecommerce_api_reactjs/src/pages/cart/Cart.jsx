import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';
import { useToast } from '../../contexts/ToastContext';
import ShopHeader from '../../components/layouts/ShopHeader';
import ShopFooter from '../../components/layouts/ShopFooter';
import Loading from '../../components/common/Loading';
import ModalDelete from '../../components/common/ModalDelete';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import {
  getCart,
  updateCartItem,
  removeFromCart,
} from '../../services/cartService';

function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const { openLoginPrompt } = useAuthPrompt();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { loadCart } = useCart();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      openLoginPrompt();
      navigate('/');
    }
  }, [isAuthenticated, isInitializing, openLoginPrompt, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCartFromAPI();
    }
  }, [isAuthenticated]);

  const loadCartFromAPI = async () => {
    try {
      setIsLoadingCart(true);
      setError('');
      const response = await getCart();
      if (response.data.success) {
        const items = response.data.data || [];
        setCartItems(items);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart items');
    } finally {
      setIsLoadingCart(false);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(id, newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item,
        ),
      );
      // Sync global cart state
      await loadCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      showToast('Failed to update quantity', 'error');
    }
  };

  const removeItem = async (id) => {
    try {
      await removeFromCart(id);
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      showToast('Item removed from cart', 'success');
      // Sync global cart state
      await loadCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      showToast('Failed to remove item from cart', 'error');
    }
  };

  const handleRemoveClick = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await removeItem(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const getProductImage = (item) => {
    return item.imageUrl || null;
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  const tax = subtotal * 0.10;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/payment', { state: { cartItems } });
  };



  return (
    <div className="cart-root">
      <style>{`
        .cart-root {
          min-height: 100vh;
          background: #050508;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
        }

        .orb {
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.15;
          animation: drift 15s ease-in-out infinite;
        }
        .orb-1 { top: -100px; right: -50px; background: radial-gradient(circle, #00ff8c 0%, transparent 70%); }
        .orb-2 { bottom: -100px; left: -50px; background: radial-gradient(circle, #00c9ff 0%, transparent 70%); animation-delay: -5s; }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }

        .cart-grid-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: linear-gradient(rgba(0, 255, 140, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 140, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .cart-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 28px 48px;
          position: relative;
          z-index: 1;
        }

        .cart-header {
          margin-bottom: 32px;
        }

        .cart-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .cart-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
          margin-bottom: 48px;
        }

        @media (max-width: 900px) {
          .cart-grid {
            grid-template-columns: 1fr;
          }
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          transition: all 0.2s ease;
        }

        .cart-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(0, 255, 140, 0.2);
        }

        .cart-item-img {
          width: 120px;
          height: 120px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-item-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-img-fallback {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.1);
        }

        .cart-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .cart-item-name {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 4px;
        }

        .cart-item-price {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #00ff8c;
          margin-bottom: 12px;
        }

        .cart-item-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .cart-qty-ctrl {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
        }

        .cart-qty-btn {
          padding: 6px 10px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.55);
          cursor: pointer;
          font-size: 14px;
          transition: color 0.2s;
        }

        .cart-qty-btn:hover {
          color: #00ff8c;
        }

        .cart-qty-val {
          padding: 6px 12px;
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          min-width: 40px;
          text-align: center;
        }

        .cart-remove-btn {
          padding: 6px 12px;
          background: rgba(255, 71, 87, 0.08);
          border: 1px solid rgba(255, 71, 87, 0.25);
          border-radius: 8px;
          color: #ff7b8a;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .cart-remove-btn:hover {
          background: rgba(255, 71, 87, 0.15);
        }

        .cart-summary {
          padding: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          position: sticky;
          top: 80px;
          height: fit-content;
        }

        .cart-summary-title {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cart-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.55);
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .cart-summary-row.total {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
          font-size: 16px;
          font-weight: 700;
          color: #00ff8c;
        }

        .cart-summary-value {
          font-weight: 600;
          color: #fff;
        }

        .cart-checkout-btn {
          width: 100%;
          padding: 14px 16px;
          margin-top: 20px;
          background: linear-gradient(135deg, #00ff8c, #00c9ff);
          border: none;
          border-radius: 12px;
          color: #050508;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cart-checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 140, 0.3);
        }

        .cart-checkout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cart-empty {
          padding: 48px 28px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          text-align: center;
        }

        .cart-empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .cart-empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
        }

        .cart-empty-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 24px;
        }

        .cart-continue-btn {
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
          transition: all 0.2s ease;
        }

        .cart-continue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 140, 0.3);
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          backdrop-filter: blur(16px);
        }

        .modal h2 {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
        }

        .modal p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .modal button {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .modal button:first-of-type {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
          margin-right: 12px;
        }

        .modal button:first-of-type:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
        }

        .modal button:last-of-type {
          background: rgba(255, 71, 87, 0.15);
          color: #ff7b8a;
          border: 1px solid rgba(255, 71, 87, 0.3);
        }

        .modal button:last-of-type:hover {
          background: rgba(255, 71, 87, 0.25);
        }
      `}</style>

      <div className="cart-grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      
      <ShopHeader />

      <main className="cart-main">
        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {isInitializing || isLoadingCart ? (
          <div style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loading label="Loading cart..." variant="page" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2 className="cart-empty-title">Your cart is empty</h2>
            <p className="cart-empty-text">
              Looks like you haven't added anything yet.
            </p>
            <Link to="/" className="cart-continue-btn">
              Continue Shopping →
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items">
              {cartItems.map((item) => {
                const imageUrl = getProductImage(item);
                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-img">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} />
                      ) : (
                        <span className="cart-item-img-fallback">
                          {(item.name || 'P').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  <div className="cart-item-info">
                    <div>
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">
                        ${Number(item.price).toFixed(2)}
                      </div>
                    </div>
                    <div className="cart-item-controls">
                      <div className="cart-qty-ctrl">
                        <button
                          className="cart-qty-btn"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="cart-qty-val">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-remove-btn"
                        onClick={() => handleRemoveClick(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-title">Order Summary</div>
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span className="cart-summary-value">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="cart-summary-row">
                <span>Tax (10%)</span>
                <span className="cart-summary-value">${tax.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span className="cart-summary-value">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="cart-summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                className="cart-checkout-btn"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Checkout'}
              </button>
              <Link to="/" style={{ display: 'block', marginTop: '16px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.045)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.65)',
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.045)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                  }}
                >
                  ← Continue Shopping
                </div>
              </Link>
            </div>
          </div>
        )}
      </main>

      <ModalDelete
        open={deleteModalOpen}
        title="Remove item from cart"
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      <ShopFooter />
    </div>
  );
}

export default CartPage;
