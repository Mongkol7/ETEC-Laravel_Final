import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';
import ShopHeader from '../../components/layouts/ShopHeader';
import ShopFooter from '../../components/layouts/ShopFooter';
import ProductCard from '../../components/products/ProductCard';
import Loading from '../../components/common/Loading';
import { getFavourites } from '../../services/favouriteService';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useToast } from '../../contexts/ToastContext';

function FavouritePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated, isInitializing } = useAuth();
  const { openLoginPrompt } = useAuthPrompt();
  const { addToCart: contextAddToCart } = useCart();
  const { toggleWishlistItem } = useWishlist();
  
  const [favourites, setFavourites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      openLoginPrompt();
      navigate('/');
    }
  }, [isAuthenticated, isInitializing, openLoginPrompt, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!document.getElementById('bs-css')) {
      const link = document.createElement('link');
      link.id = 'bs-css';
      link.rel = 'stylesheet';
      link.href =
        'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css';
      document.head.appendChild(link);
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const favsResponse = await getFavourites();

      if (favsResponse.data.success) {
        setFavourites(favsResponse.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load page data:', err);
      setError('Failed to load your wishlist items.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavourite = async (productId) => {
    try {
      const product = favourites.find((p) => p.id === productId);
      const productName = product ? product.name : 'Product';
      const success = await toggleWishlistItem(productId);
      if (success) {
        setFavourites((prev) => prev.filter((item) => item.id !== productId));
        showToast(`Removed "${productName}" from wishlist`, 'info');
      }
    } catch (err) {
      console.error('Failed to remove favourite:', err);
      setError('Failed to remove item from wishlist.');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await contextAddToCart(product.id, 1);
      showToast(`Added "${product.name}" to cart`, 'success');
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      showToast('Failed to add item to cart', 'info');
    }
  };



  return (
    <div className="fav-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .fav-root {
          min-height: 100vh;
          background: #050508;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
        }

        /* ── ambient orbs ── */
        .orb { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; animation: drift 11s ease-in-out infinite; z-index: 0; }
        .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,255,140,.10) 0%, transparent 70%); top: -180px; left: -120px; animation-duration: 12s; }
        .orb-2 { width: 480px; height: 480px; background: radial-gradient(circle, rgba(0,180,255,.09) 0%, transparent 70%); top: 30%; right: -140px; animation-duration: 14s; animation-delay: -4s; }
        .orb-3 { width: 380px; height: 380px; background: radial-gradient(circle, rgba(160,0,255,.06) 0%, transparent 70%); bottom: -120px; left: 30%; animation-duration: 16s; animation-delay: -7s; }
        @keyframes drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-22px) scale(1.05); }
          66%      { transform: translate(-22px,18px) scale(.96); }
        }

        .fav-grid-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: linear-gradient(rgba(0, 255, 140, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 140, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .fav-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 28px 48px;
          position: relative;
          z-index: 1;
        }

        .fav-header {
          margin-bottom: 32px;
        }

        .fav-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .fav-title span {
          background: linear-gradient(135deg, #00ff8c, #00c9ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .fav-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
        }

        .fav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .fav-empty {
          padding: 64px 28px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          text-align: center;
          max-width: 600px;
          margin: 40px auto;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
        }

        .fav-empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          animation: pulse-heart 2s infinite ease-in-out;
        }

        @keyframes pulse-heart {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .fav-empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 12px;
        }

        .fav-empty-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 28px;
        }

        .fav-continue-btn {
          display: inline-block;
          padding: 12px 28px;
          background: linear-gradient(135deg, #00ff8c, #00c9ff);
          border: none;
          border-radius: 12px;
          color: #050508;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 18px rgba(0, 255, 140, 0.25);
        }

        .fav-continue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 140, 0.35);
        }

        .fav-error {
          padding: 16px 20px;
          background: rgba(255, 71, 87, 0.08);
          border: 1px solid rgba(255, 71, 87, 0.2);
          border-radius: 12px;
          color: #ff7b8a;
          margin-bottom: 24px;
          font-size: 14px;
        }

        /* ─────────────────────────────────────────────────────
           Product card — self-contained so these styles work
           even when Home.jsx CSS is not loaded on this route.
           ───────────────────────────────────────────────────── */
        .product-card {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 20px;
          transition: all .3s cubic-bezier(.4,0,.2,1);
          height: 100%;
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }
        .product-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0,255,140,.25);
          box-shadow: 0 16px 40px rgba(0,0,0,.4), 0 0 40px rgba(0,255,140,.06);
        }
        .product-card button { padding: 0; font: inherit; }

        .product-img {
          position: relative;
          aspect-ratio: 1;
          border-radius: 20px 20px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 52px;
          overflow: hidden;
        }
        .product-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(5,5,8,.4) 100%);
        }
        .product-img-photo {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .product-img-fallback {
          position: relative;
          z-index: 1;
          width: 72px;
          height: 72px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.08);
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 800;
        }
        .product-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .4px;
          padding: 4px 9px;
          border-radius: 8px;
          color: #050508;
          font-family: 'Syne', sans-serif;
        }
        .product-wish {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: rgba(5,5,8,.5);
          border: 1px solid rgba(255,255,255,.1);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s;
          color: rgba(255,255,255,.5);
        }
        .product-wish:hover { background: rgba(5,5,8,.7); }
        .product-wish.active { color: #ff4d80; }

        .product-body {
          padding: 14px 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .product-cat {
          font-size: 10.5px;
          color: rgba(255,255,255,.28);
          letter-spacing: .8px;
          text-transform: uppercase;
          font-weight: 500;
        }
        .product-name {
          font-size: 13.5px;
          color: #fff;
          font-weight: 500;
          line-height: 1.4;
          font-family: 'DM Sans', sans-serif;
        }
        .product-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11.5px;
          color: rgba(255,255,255,.3);
        }
        .product-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #ffaa00;
        }
        .product-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 6px;
        }
        .product-price {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .price-now {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #00ff8c;
        }
        .price-old {
          font-size: 12px;
          color: rgba(255,255,255,.25);
          text-decoration: line-through;
        }
        .product-add {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          flex-shrink: 0;
          background: rgba(0,255,140,.1);
          border: 1px solid rgba(0,255,140,.25);
          color: #00ff8c;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s;
        }
        .product-add:hover {
          background: #00ff8c;
          color: #050508;
          box-shadow: 0 4px 16px rgba(0,255,140,.35);
        }
        .product-add:disabled {
          opacity: .45;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* fade-up */
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
        .fu { animation: fadeUp .5s cubic-bezier(.4,0,.2,1) both; }
      `}</style>

      <div className="fav-grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <ShopHeader />

      <main className="fav-main">
        <div className="fav-header">
          <h1 className="fav-title">My <span>Favourites</span></h1>
          <p className="fav-subtitle">
            {favourites.length} {favourites.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {error && <div className="fav-error">{error}</div>}

        {isInitializing || isLoading ? (
          <div style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loading label="Loading wishlist..." variant="page" />
          </div>
        ) : favourites.length === 0 ? (
          <div className="fav-empty">
            <div className="fav-empty-icon">❤️</div>
            <h2 className="fav-empty-title">Your wishlist is empty</h2>
            <p className="fav-empty-text">
              Save your favorite items here to check them out later.
            </p>
            <Link to="/" className="fav-continue-btn">
              Explore Products →
            </Link>
          </div>
        ) : (
          <div className="fav-grid">
            {favourites.map((product, index) => (
              <div key={product.id} className="fu" style={{ animationDelay: `${index * 0.05}s` }}>
                <ProductCard
                  product={product}
                  isWishlisted={true}
                  onToggleWishlist={handleRemoveFavourite}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <ShopFooter />
    </div>
  );
}

export default FavouritePage;
